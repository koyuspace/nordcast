#!/usr/bin/python3
import os
import redis

files = os.listdir("authtokens/")
r = redis.StrictRedis(host='localhost', port=6379, db=0)

for f in files:
    os.rename("authtokens/"+f, "authtokens/"+f.replace(".secret", ".koyu.space.secret"))
    uuid = str(r.get("nordcast/uuids/" + f.replace(".secret", ""))).replace("b'", "").replace("'", "")
    r.set("nordcast/uuids/" + f.replace(".secret", "") + "$$koyu.space", uuid)
    podlist = str(r.get("nordcast/podlist/" + f.replace(".secret", ""))).replace("b'", "").replace("'", "")
    r.set("nordcast/podlist/" + f.replace(".secret", "") + "$$koyu.space", podlist)