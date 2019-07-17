#!/usr/bin/python3
# -*- coding: utf-8 -*-

from bottle import get, post, request, response, route, run, redirect
from mastodon import Mastodon
import feedparser
import json
import os.path
import redis
import uuid
import requests

r = redis.StrictRedis(host='localhost', port=6379, db=0)

@get("/")
def index():
    return redirect("https://nordcast.app", code=302)

@get("/api/v1/getpodcast")
def getpodcast():
    q = request.query["q"] # pylint: disable=unsubscriptable-object
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    response.set_header("Cache-Control", "public, max-age=604800")
    return json.dumps(feedparser.parse(q), default=lambda o: '<not serializable>')

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
    instance = request.forms.get("instance") # pylint: disable=no-member
    if not os.path.exists('clientcred.'+instance+'.secret'):
        Mastodon.create_app(
            'Nordcast',
            api_base_url = 'https://'+instance,
            to_file = 'clientcred.'+instance+'.secret'
        )
    mastodon = Mastodon(
        client_id = 'clientcred.'+instance+'.secret',
        api_base_url = 'https://'+instance
    )
    mastodon.log_in(
        username,
        password,
        to_file = 'authtokens/'+username+'.'+instance+'.secret',
    )
    if not os.path.exists("usercred.secret"):
        suid = str(uuid.uuid1())
        r.set("nordcast/uuids/" + username + "$$" + instance, suid)
        return json.dumps({"login": "ok", "uuid": suid})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/login2/<username>/<uuid>/<instance>")
def login2(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    try:
        mastodon = Mastodon(
            access_token = 'authtokens/'+username+'.'+instance+'.secret',
            api_base_url = 'https://'+instance
        )
        mastodon.account_verify_credentials().source.note
    except:
        pass
    if suid == uuid:
        return json.dumps({"login": "ok", "uuid": uuid})
    else:
        return "{\"login\": \"error\"}"

@post("/api/v1/setlist/<username>/<uuid>/<instance>")
def setlist(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    podlist = request.forms.get("podlist") # pylint: disable=no-member
    if suid == uuid:
        r.set("nordcast/podlist/" + username + "$$" + instance, podlist)
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success"})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/getlist/<username>/<uuid>/<instance>")
def getlist(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    podlist = str(r.get("nordcast/podlist/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if suid == uuid:
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "podlist": podlist})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/setpos/<username>/<uuid>/<secret>/<pos>/<instance>")
def setpos(username, uuid, secret, pos, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if suid == uuid:
        r.set("nordcast/pos/" + username + "$$" + instance + "/" + secret, pos)
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success"})

@get("/api/v1/getpos/<username>/<uuid>/<secret>/<instance>")
def getpos(username, uuid, secret, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if suid == uuid:
        pos = str(r.get("nordcast/pos/" + username + "$$" + instance + "/" + secret)).replace("b'", "").replace("'", "")
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "pos": pos, "secret": secret})

@get("/api/v1/getname/<username>/<uuid>/<instance>")
def getname(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if not uuid == "dummy":
        mastodon = Mastodon(
            access_token = 'authtokens/'+username+'.'+instance+'.secret',
            api_base_url = 'https://'+instance
        )
        userdict = mastodon.account_verify_credentials()
    try:
        if suid == uuid:
            ksname = userdict.display_name
            ksemojis = userdict.emojis
            return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "ksname": ksname, "ksemojis": ksemojis})
        else:
            return "{\"login\": \"error\"}"
    except:
        return "{\"login\": \"error\"}"

@get("/api/v1/getpic/<username>/<uuid>/<instance>")
def getpic(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if not uuid == "dummy":
        mastodon = Mastodon(
            access_token = 'authtokens/'+username+'.'+instance+'.secret',
            api_base_url = 'https://'+instance
        )
        userdict = mastodon.account_verify_credentials()
    try:
        if suid == uuid:
            kspic = userdict.avatar
            return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "kspic": kspic})
        else:
            return "{\"login\": \"error\"}"
    except:
        return "{\"login\": \"error\"}"

@get("/api/v1/getemoji/<username>/<uuid>/<instance>")
def getemoji(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if not uuid == "dummy":
        mastodon = Mastodon(
            access_token = 'authtokens/'+username+'.'+instance+'.secret',
            api_base_url = 'https://'+instance
        )
        userdict = mastodon.account_verify_credentials()
    try:
        if suid == uuid:
            ksemoji = mastodon.custom_emojis()
            return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "ksemoji": ksemoji})
        else:
            return "{\"login\": \"error\"}"
    except:
        return "{\"login\": \"error\"}"

@get("/api/v1/search/<lang>/<query>")
def search(lang,query):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    query = query.replace(" ", "%20")
    url = "https://itunes.apple.com/"+lang+"/search?term="+query+"&media=podcast"
    data = requests.get(url)
    return data

@get("/api/v1/search/<lang>/")
def searche(lang):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return ""

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