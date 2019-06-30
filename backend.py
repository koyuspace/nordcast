from bottle import get, post, request, response, route, run
from mastodon import Mastodon
import feedparser
import json
import os.path
import redis
import uuid
import requests

admin = "koyu"
r = redis.StrictRedis(host='localhost', port=6379, db=0)

@get("/api/v1/getpodcast")
def getpodcast():
    q = request.query["q"] # pylint: disable=unsubscriptable-object
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return json.dumps(feedparser.parse(q))

@get("/api/v1/getbanner/<val>")
def getbanner(val):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "image/jpeg"
    f = open("banners/"+val+".jpg", "rb")
    img = f.read()
    f.close()
    return img

@post("/api/v1/login")
def login():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    username = request.forms.get("username") # pylint: disable=no-member
    password = request.forms.get("password") # pylint: disable=no-member
    mastodon = Mastodon(
        client_id = 'clientcred.secret',
        api_base_url = 'https://koyu.space'
    )
    mastodon.log_in(
        username,
        password,
        to_file = 'authtokens/'+username+'.secret'
    )
    if not os.path.exists("usercred.secret"):
        suid = str(uuid.uuid1())
        r.set("nordcast/uuids/" + username, suid)
        return json.dumps({"login": "ok", "uuid": suid})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/login2/<username>/<uuid>")
def login2(username, uuid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username)).replace("b'", "").replace("'", "")
    mastodon = Mastodon(
        access_token = 'authtokens/'+username+'.secret',
        api_base_url = 'https://koyu.space'
    )
    mastodon.account_verify_credentials().source.note
    if suid == uuid:
        return json.dumps({"login": "ok", "uuid": uuid})
    else:
        return "{\"login\": \"error\"}"

@post("/api/v1/setlist/<username>/<uuid>")
def setlist(username, uuid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username)).replace("b'", "").replace("'", "")
    podlist = request.forms.get("podlist") # pylint: disable=no-member
    mastodon = Mastodon(
        access_token = 'authtokens/'+username+'.secret',
        api_base_url = 'https://koyu.space'
    )
    mastodon.account_verify_credentials().source.note
    if suid == uuid:
        r.set("nordcast/podlist/" + username, podlist)
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success"})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/getlist/<username>/<uuid>")
def getlist(username, uuid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    podlist = str(r.get("nordcast/podlist/" + username)).replace("b'", "").replace("'", "")
    suid = str(r.get("nordcast/uuids/" + username)).replace("b'", "").replace("'", "")
    mastodon = Mastodon(
        access_token = 'authtokens/'+username+'.secret',
        api_base_url = 'https://koyu.space'
    )
    mastodon.account_verify_credentials().source.note
    if suid == uuid:
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "podlist": podlist})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/getview/<username>/<uuid>/<view>")
def getview(username, uuid, view):
    response.headers['Access-Control-Allow-Origin'] = '*'
    suid = str(r.get("nordcast/uuids/" + username)).replace("b'", "").replace("'", "")
    mastodon = Mastodon(
        access_token = 'authtokens/'+username+'.secret',
        api_base_url = 'https://koyu.space'
    )
    mastodon.account_verify_credentials().source.note
    if suid == uuid:
        response.content_type = "text/html"
        f = open("views/"+view+"view.html", "r")
        s = f.read()
        f.close()
        return s
    else:
        response.content_type = "application/json"
        return "{\"login\": \"error\"}"

@get("/api/v1/getname/<username>/<uuid>")
def getname(username, uuid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username)).replace("b'", "").replace("'", "")
    mastodon = Mastodon(
        access_token = 'authtokens/'+username+'.secret',
        api_base_url = 'https://koyu.space'
    )
    userdict = mastodon.account_verify_credentials()
    if suid == uuid:
        ksname = userdict.username
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "ksname": ksname})

@get("/api/v1/search/<lang>/<query>")
def search(lang,query):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    query = query.replace(" ", "%20")
    url = "https://itunes.apple.com/"+lang+"/search?term="+query+"&media=podcast"
    data = requests.get(url)
    return data

@get("/api/v1/getoriginals")
def getoriginals():
    f = open("data/originals", "r")
    x = f.read()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return json.dumps({"podlist": x})

@get("/api/v1/getfeatured")
def gefeatured():
    f = open("data/featured", "r")
    x = f.readlines()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    l = []
    for i in x:
        l.append([i.split("#")[0], i.split("#")[1]])
    return json.dumps(l)

run(server="tornado",port=9000,host="0.0.0.0")