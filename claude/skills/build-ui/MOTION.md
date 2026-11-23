# Motion beyond CSS

Read when a section needs generated motion: a looping graphic layered into the UI, or a transition scrubbed by scroll or a gesture. CSS transitions cover the rest. Both cases below generate the motion with a video model through `genmedia`.

**Animated graphics that do not read as video.** Generate a looping clip against a solid background, then chroma key it out, or run a video matting model when the edges are complex. What you get back is an animation you can layer anywhere in the UI. For anything glassy, chrome, or refractive, render the clip over the page's own background colors first so the refraction bakes into the pixels, then matte the background out. Render it on a neutral background and composite afterwards and the glass looks fake.

**Scroll and gesture transitions.** Many video models interpolate between two keyframe images, so two product stills become a transition clip you can scrub frame by frame as the user scrolls or swipes. Chain several by seeding each clip with the previous clip's final frame, which keeps the sequence continuous. Ask `genmedia` for a model with strong physics and temporal consistency.

Video is billed per clip. Check `genmedia pricing <endpoint_id>` before a batch and keep the clips short.
