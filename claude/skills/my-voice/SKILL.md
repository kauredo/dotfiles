---
name: my-voice
description: Speak text in the owner's own cloned voice, European Portuguese or English, for a narration, voiceover, voice line or demo audio. Also for rebuilding the clone from new recordings.
---

# My voice

The owner's voice is cloned on fal with MiniMax, one clone per language. The clone takes its accent from the language of its sample, so Portuguese text goes to the Portuguese clone and English text to the English one.

## Private reference

The voice IDs, the recordings and the history live in the owner's private vault, in `~/Notes/03_Resources/Voice Clone.md`. Read it before the first call. This repo is public: keep voice IDs, sample URLs and recordings out of it, and out of any public repo the narration ends up in.

## Speaking a script

1. **Fit the script to speech.** One idea per sentence, one sentence per line. Portuguese is European Portuguese ("carregue em", "ecrã", "equipa").
2. **Send plain text, with no pause markers.** MiniMax's `<#x#>` markers come out near 0.75 s whatever the number, and pausing before a key word ("o <#0.2#>tablet") sounds broken to the owner. Let the clone phrase naturally and put emphasis in the visuals. Respell a word the clone says badly ("Stramatél", "télémóvel"); captions keep the real spelling.
3. **Send one line first.** Generate a single representative line and give the owner the file. You cannot hear the result; the owner judges accent and naturalness. Wait for a yes before the rest.
4. **Generate one clip per line** with `fal-ai/minimax/speech-02-hd`, through the fal MCP tool `execute_custom_model`:

   ```json
   {"text": "…", "language_boost": "Portuguese",
    "voice_setting": {"voice_id": "<from the note>", "speed": 1}}
   ```

   Use `language_boost` `Portuguese` for Portuguese text; it stops words drifting towards Spanish. One clip per line keeps timing and retakes per line.
5. **Even out the pauses and level every clip.** The clone pauses unevenly: long gaps mid-phrase, short ones at full stops. Rebuild each clip so a full stop gets 0.5 s, a comma 0.28 s, anything else at most 0.22 s, with -16 LUFS. `~/code/personal/misc/marcador-cnn-videos/tools/pausas.py <raw_dir> <out_dir> <script.txt>` does this; it places each script comma and full stop by its position in the text, since the transcriber's word times ignore pauses.
6. **Time captions and cuts from the audio.** `npx hyperframes transcribe <clip> --model small --language pt` (or `en`) streams word timings; match them to the script words by position. The transcriber mishears words the voice says correctly, so keep the script's spelling for captions.

Done when every line has a levelled clip, the owner has approved the sample line, and each clip's duration is recorded for the edit.

## Rebuilding the clone from new recordings

1. Join the recordings for one language into a single sample: trim leading and trailing silence, level each to -18 LUFS, and join with 0.7 s of silence between clips. Two to three minutes in several registers (calm, explaining, energetic) beats one long reading of one text. Add the older recordings from the vault so the sample keeps growing.
2. Upload it: `genmedia upload <file> --json` returns a `cdn_url`. genmedia needs `FAL_KEY`; read it from the fal MCP server's `env` in `~/.claude-b/.claude.json` into the environment, never into output.
3. Clone with `fal-ai/minimax/voice-clone`: `audio_url`, `noise_reduction: true`, `need_volume_normalization: true`, and `text` set to a test line in that language. The result carries `custom_voice_id` and a preview.
4. Use the new ID in one `speech-02-hd` call; MiniMax deletes a clone that no TTS call uses within 7 days.
5. Update the voice table in the vault note, move the old ID to "Superseded", and save the new recordings under `~/Notes/05_Attachments/Voz/`.

Done when the owner prefers the new preview to the old voice and the vault note names the new ID.
