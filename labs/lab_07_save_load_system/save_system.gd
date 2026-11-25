## Versioned, crash-safe Save/Load system using JSON + HMAC-SHA256 + atomic file writes.
## Deliberately avoids ResourceLoader on user saves to prevent .tres script execution risks.
class_name SaveSystem
extends RefCounted

const CURRENT_SCHEMA_VERSION: int = 2
const SAVE_DIR: String = "user://saves"
const FILE_EXT: String = ".sav"
const TMP_EXT: String = ".tmp"
const BAK_EXT: String = ".bak"


class SaveResult extends RefCounted:
	var ok: bool = false
	var error: Error = OK
	var message: String = ""
	var payload: Dictionary = {}
	var used_backup: bool = false

	static func success(data: Dictionary = {}, from_backup: bool = false) -> SaveResult:
		var res := SaveResult.new()
		res.ok = true
		res.error = OK
		res.payload = data
		res.used_backup = from_backup
		return res

	static func failure(err: Error, msg: String) -> SaveResult:
		var res := SaveResult.new()
		res.ok = false
		res.error = err
		res.message = msg
		return res


var _hmac_key: PackedByteArray


func _init(integrity_key: String = "phase1_local_integrity_key") -> void:
	_hmac_key = integrity_key.to_utf8_buffer()


func capture_tree_state(tree: SceneTree, metadata: Dictionary = {}) -> Dictionary:
	var entities: Dictionary = {}
	if tree != null:
		for node in tree.get_nodes_in_group(SaveableComponent.SAVEABLE_GROUP):
			if node is SaveableComponent and is_instance_valid(node):
				var comp := node as SaveableComponent
				if comp.persistent_id.is_empty():
					push_warning(
						"SaveSystem: Skipped '%s' with empty persistent_id." % comp.name
					)
					continue
				entities[String(comp.persistent_id)] = comp.capture_state()

	return {
		"schema_version": CURRENT_SCHEMA_VERSION,
		"saved_at_unix": int(Time.get_unix_time_from_system()),
		"metadata": metadata.duplicate(true),
		"entities": entities,
	}


func apply_tree_state(tree: SceneTree, payload: Dictionary) -> int:
	if tree == null or not payload.has("entities") or not (payload["entities"] is Dictionary):
		return 0
	var entities: Dictionary = payload["entities"]
	var restored_count: int = 0
	for node in tree.get_nodes_in_group(SaveableComponent.SAVEABLE_GROUP):
		if node is SaveableComponent and is_instance_valid(node):
			var comp := node as SaveableComponent
			var key := String(comp.persistent_id)
			if entities.has(key) and entities[key] is Dictionary:
				comp.restore_state(entities[key] as Dictionary)
				restored_count += 1
	return restored_count


func save_slot(slot_id: String, payload: Dictionary) -> SaveResult:
	var clean_id := _sanitize_slot_id(slot_id)
	if clean_id.is_empty():
		return SaveResult.failure(ERR_INVALID_PARAMETER, "Invalid slot_id.")

	var dir_err := DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	if dir_err != OK:
		return SaveResult.failure(dir_err, "Failed to create save directory.")

	var envelope := _build_signed_envelope(payload)
	var json_text := JSON.stringify(envelope, "\t", true)

	var final_path := _get_slot_path(clean_id, FILE_EXT)
	var tmp_path := _get_slot_path(clean_id, TMP_EXT)
	var bak_path := _get_slot_path(clean_id, BAK_EXT)

	var tmp_file := FileAccess.open(tmp_path, FileAccess.WRITE)
	if tmp_file == null:
		return SaveResult.failure(FileAccess.get_open_error(), "Unable to open temp save file.")
	tmp_file.store_string(json_text)
	tmp_file.flush()
	tmp_file.close()

	# Rotate previous verified save into .bak before atomically promoting .tmp -> .sav.
	if FileAccess.file_exists(final_path):
		if FileAccess.file_exists(bak_path):
			DirAccess.remove_absolute(bak_path)
		var bak_err := DirAccess.rename_absolute(final_path, bak_path)
		if bak_err != OK:
			push_warning(
				"SaveSystem: Backup rotation failed for '%s' (err=%d)." % [clean_id, bak_err]
			)

	var promote_err := DirAccess.rename_absolute(tmp_path, final_path)
	if promote_err != OK:
		return SaveResult.failure(promote_err, "Atomic rename failed when promoting save file.")

	return SaveResult.success(payload)


func load_slot(slot_id: String) -> SaveResult:
	var clean_id := _sanitize_slot_id(slot_id)
	if clean_id.is_empty():
		return SaveResult.failure(ERR_INVALID_PARAMETER, "Invalid slot_id.")

	var primary := _read_and_verify(_get_slot_path(clean_id, FILE_EXT), false)
	if primary.ok:
		return primary

	var backup_path := _get_slot_path(clean_id, BAK_EXT)
	if FileAccess.file_exists(backup_path):
		push_warning(
			"SaveSystem: Primary '%s' failed (%s); using backup." % [clean_id, primary.message]
		)
		var fallback := _read_and_verify(backup_path, true)
		if fallback.ok:
			return fallback

	return primary


func migrate_payload(raw_payload: Dictionary) -> SaveResult:
	var data := raw_payload.duplicate(true)
	var version: int = int(data.get("schema_version", 0))
	if version <= 0:
		return SaveResult.failure(ERR_FILE_CORRUPT, "Missing or invalid schema_version.")
	if version > CURRENT_SCHEMA_VERSION:
		return SaveResult.failure(
			ERR_FILE_UNRECOGNIZED,
			"Save v%d is newer than supported v%d." % [version, CURRENT_SCHEMA_VERSION]
		)

	while version < CURRENT_SCHEMA_VERSION:
		match version:
			1:
				data = _migrate_v1_to_v2(data)
				version = 2
			_:
				return SaveResult.failure(ERR_BUG, "Missing migration step from v%d." % version)

	return SaveResult.success(data)


func _read_and_verify(path: String, is_backup: bool) -> SaveResult:
	if not FileAccess.file_exists(path):
		return SaveResult.failure(ERR_FILE_NOT_FOUND, "Save file not found: %s" % path)

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return SaveResult.failure(FileAccess.get_open_error(), "Failed to open save file.")
	var raw_text := file.get_as_text()
	file.close()

	var payload_res := _parse_and_verify_envelope(raw_text)
	if not payload_res.ok:
		return payload_res

	var migrated := migrate_payload(payload_res.payload)
	if not migrated.ok:
		return migrated
	migrated.used_backup = is_backup
	return migrated


func _parse_and_verify_envelope(raw_text: String) -> SaveResult:
	var parsed: Variant = JSON.parse_string(raw_text)
	if not (parsed is Dictionary):
		return SaveResult.failure(ERR_PARSE_ERROR, "Save file is not valid JSON object.")
	var envelope := parsed as Dictionary
	if not envelope.has("payload_json") or not envelope.has("hmac_sha256"):
		return SaveResult.failure(ERR_FILE_CORRUPT, "Missing integrity envelope fields.")

	var payload_json := str(envelope["payload_json"])
	var expected_sig := str(envelope["hmac_sha256"])
	if _compute_hmac_hex(payload_json) != expected_sig:
		return SaveResult.failure(ERR_FILE_CORRUPT, "Integrity HMAC verification failed.")

	var payload_parsed: Variant = JSON.parse_string(payload_json)
	if not (payload_parsed is Dictionary):
		return SaveResult.failure(ERR_PARSE_ERROR, "Envelope payload_json is invalid.")
	return SaveResult.success(payload_parsed as Dictionary)


func _build_signed_envelope(payload: Dictionary) -> Dictionary:
	var canonical_payload := JSON.stringify(payload, "", true)
	return {
		"format": "godot_lab_save_envelope",
		"payload_json": canonical_payload,
		"hmac_sha256": _compute_hmac_hex(canonical_payload),
	}


func _compute_hmac_hex(text: String) -> String:
	var ctx := HMACContext.new()
	var err := ctx.start(HashingContext.HASH_SHA256, _hmac_key)
	if err != OK:
		push_error("SaveSystem: HMACContext.start failed (err=%d)." % err)
		return ""
	ctx.update(text.to_utf8_buffer())
	return ctx.finish().hex_encode()


func _migrate_v1_to_v2(v1: Dictionary) -> Dictionary:
	# Example deterministic migration: v1 stored "actors" dict and lacked "metadata".
	var v2 := v1.duplicate(true)
	if v2.has("actors") and not v2.has("entities"):
		v2["entities"] = v2["actors"]
		v2.erase("actors")
	if not v2.has("metadata"):
		v2["metadata"] = {}
	v2["schema_version"] = 2
	return v2


func _sanitize_slot_id(slot_id: String) -> String:
	var clean := slot_id.strip_edges()
	if clean.is_empty() or clean.contains("/") or clean.contains("\\") or clean.contains(".."):
		return ""
	return clean


func _get_slot_path(clean_id: String, ext: String) -> String:
	return "%s/%s%s" % [SAVE_DIR, clean_id, ext]
