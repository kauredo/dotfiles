#!/usr/bin/env python3
"""Render Claude Design canvas artboards (.dc.html) to PNGs with headless Chrome.

Usage:
  render.py --src <folder holding the .dc.html files> --out <round folder>
            --web Name1,Name2 --phone Name3,Name4 [--prev <previous round folder>]
            [--web-size 1280x1500] [--phone-size 390x1720] [--assets assets.json]

Names are artboard stems (Main for Main.dc.html). Each board is converted to
plain HTML (support.js, <x-dc>, <helmet> and the logic script removed), then
screenshotted. With --prev, any image byte-identical to the previous round is
reported as UNCHANGED: a fix that never reached the screen.
With --assets, a JSON map of uploaded asset id to local file path, every
/_blob/<id> url is swapped for that file so uploads render locally.
"""
import argparse, filecmp, json, os, re, subprocess, sys

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def to_plain(src_path, dst_path, assets=None):
    s = open(src_path, encoding="utf-8").read()
    for blob_id, local in (assets or {}).items():
        s = s.replace(f"/_blob/{blob_id}", "file://" + os.path.abspath(local))
    s = s.replace('<script src="./support.js"></script>', "")
    s = re.sub(r'<script type="text/x-dc".*?</script>', "", s, flags=re.S)
    for tag in ("<x-dc>", "</x-dc>", "<helmet>", "</helmet>"):
        s = s.replace(tag, "")
    open(dst_path, "w", encoding="utf-8").write(s)


def shoot(html, png, size, profile):
    w, h = size.split("x")
    cmd = [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
           f"--window-size={w},{h}", "--virtual-time-budget=4000",
           f"--screenshot={png}", f"--user-data-dir={profile}", f"file://{html}"]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=40)
    except subprocess.TimeoutExpired:
        pass  # headless Chrome often hangs after writing the PNG; the file check decides
    return os.path.exists(png) and os.path.getsize(png) > 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--web", default="")
    ap.add_argument("--phone", default="")
    ap.add_argument("--prev")
    ap.add_argument("--web-size", default="1280x1500")
    ap.add_argument("--phone-size", default="390x1720")
    ap.add_argument("--assets")
    a = ap.parse_args()
    assets = json.load(open(a.assets)) if a.assets else {}

    os.makedirs(a.out, exist_ok=True)
    work = os.path.join(a.out, ".html")
    os.makedirs(work, exist_ok=True)
    profile = os.path.join(a.out, ".chrome-profile")
    failed = []
    for names, size in ((a.web, a.web_size), (a.phone, a.phone_size)):
        for name in filter(None, names.split(",")):
            src = os.path.join(a.src, f"{name}.dc.html")
            html = os.path.join(work, f"{name}.html")
            png = os.path.join(a.out, f"{name}.png")
            if os.path.exists(png):
                os.remove(png)
            to_plain(src, html, assets)
            if not shoot(os.path.abspath(html), os.path.abspath(png), size, os.path.abspath(profile)):
                failed.append(name)
            elif a.prev and os.path.exists(os.path.join(a.prev, f"{name}.png")) and \
                    filecmp.cmp(png, os.path.join(a.prev, f"{name}.png"), shallow=False):
                print(f"UNCHANGED {name}")
    for name in failed:
        print(f"FAILED {name}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
