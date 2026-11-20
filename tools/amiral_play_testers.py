# Play kapali test kanalinin (alpha) test gruplarini ve surum durumunu yazdirir
import json, os, requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
info = json.loads(os.environ["SA"])
cr = service_account.Credentials.from_service_account_info(info, scopes=["https://www.googleapis.com/auth/androidpublisher"]); cr.refresh(Request())
H = {"Authorization": "Bearer " + cr.token}
B = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.amiralbatti.game"
e = requests.post(B + "/edits", headers=H).json(); eid = e["id"]
for tr in ["alpha", "beta", "internal"]:
    t = requests.get(f"{B}/edits/{eid}/testers/{tr}", headers=H).json()
    print("KANAL", tr, "gruplar:", t.get("googleGroups"), t.get("error", {}).get("message", ""))
tracks = requests.get(f"{B}/edits/{eid}/tracks", headers=H).json()
for t in tracks.get("tracks", []):
    print("SURUM", t["track"], [(r.get("name"), r.get("status"), r.get("versionCodes")) for r in t.get("releases", [])])
requests.delete(f"{B}/edits/{eid}", headers=H)
