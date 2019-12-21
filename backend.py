#!/usr/bin/python3
# -*- coding: utf-8 -*-

from bottle import get, post, request, response, route, run, redirect
from mastodon import Mastodon
from colorthief import ColorThief
import feedparser
import json
import os.path
import redis
import uuid
import requests
import subprocess

r = redis.StrictRedis(host='localhost', port=6379, db=0)

if os.environ.get('DEBUG') == "true":
    debug = True
else:
    debug = False

@get("/")
def index():
    return redirect("https://nordcast.app", code=302)

@get("/api/v1/getpodcast")
def getpodcast():
    q = request.query["q"] # pylint: disable=unsubscriptable-object
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    response.set_header("Cache-Control", "public, max-age=600")
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
    if debug:
        appname = "Nordcast (debug)"
    else:
        appname = "Nordcast"
    if not os.path.exists('clientcred.'+instance+'.secret'):
        Mastodon.create_app(
            appname,
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
        if r.get("nordcast/uuids/" + username + "$$" + instance) == None:
            r.set("nordcast/uuids/" + username + "$$" + instance, suid)
        else:
            r.set("nordcast/uuids/" + username + "$$" + instance, str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "") + "," + suid)
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
    if uuid in suid:
        return json.dumps({"login": "ok", "uuid": uuid})
    else:
        return "{\"login\": \"error\"}"

@post("/api/v1/setlist/<username>/<uuid>/<instance>")
def setlist(username, uuid, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    podlist = request.forms.get("podlist") # pylint: disable=no-member
    if uuid in suid:
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
    if uuid in suid:
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success", "podlist": podlist})
    else:
        return "{\"login\": \"error\"}"

@get("/api/v1/setpos/<username>/<uuid>/<secret>/<pos>/<instance>")
def setpos(username, uuid, secret, pos, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if uuid in suid:
        r.set("nordcast/pos/" + username + "$$" + instance + "/" + secret, pos)
        return json.dumps({"login": "ok", "uuid": uuid, "action": "success"})

@get("/api/v1/getpos/<username>/<uuid>/<secret>/<instance>")
def getpos(username, uuid, secret, instance):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    suid = str(r.get("nordcast/uuids/" + username + "$$" + instance)).replace("b'", "").replace("'", "")
    if uuid in suid:
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
        if uuid in suid:
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
        if uuid in suid:
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
        userdict = mastodon.account_verify_credentials() # pylint: disable=unused-variable
    try:
        if uuid in suid:
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

@get("/api/v1/getoriginals/<lang>")
def getoriginals(lang):
    f = open("data/"+lang+"/originals", "r")
    x = f.read()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return json.dumps({"podlist": x})

@get("/api/v1/getfeatured/<lang>")
def gefeatured(lang):
    f = open("data/"+lang+"/featured", "r")
    x = f.readlines()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    l = []
    for i in x:
        l.append([i.split("#")[0], i.split("#")[1]])
    return json.dumps(l)

@get("/api/v1/getoriginals")
def getoriginals_legacy():
    f = open("data/en/originals", "r")
    x = f.read()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return json.dumps({"podlist": x})

@get("/api/v1/getfeatured")
def gefeatured_legacy():
    f = open("data/en/featured", "r")
    x = f.readlines()
    f.close()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    l = []
    for i in x:
        l.append([i.split("#")[0], i.split("#")[1]])
    return json.dumps(l)

@get("/api/v1/getprimarycolor")
def getprimarycolor():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "text/plain"
    url = request.query["url"] # pylint: disable=unsubscriptable-object
    filecache = ""
    filename = "files/"+url.split("/")[len(url.split("/")) - 1]
    if "/api/v1/getbanner" in url:
        filename = "banners/"+url.split("/")[len(url.split("/")) - 1]+".jpg"
    if os.path.exists("filecache"):
        f = open("filecache", "r")
        x = f.readlines()
        f.close()
        for i in x:
            if i.split("#")[0] == filename:
                filecache = i.split("#")[1]
        if not filecache == "":
            return filecache
        else:
            if not "/api/v1/getbanner" in url:
                subprocess.Popen(["wget", "-O", filename, url], shell=False).wait()
            color_thief = ColorThief(filename)
            dominant_color = color_thief.get_color()
            x = str(dominant_color).replace("(", "").replace(" ", "").replace(")", "")
            f = open("filecache", "a+")
            f.write(filename+"#"+x+"\n")
            return x
    else:
        if not "/api/v1/getbanner" in url:
            subprocess.Popen(["wget", "-O", filename, url], shell=False).wait()
        color_thief = ColorThief(filename)
        dominant_color = color_thief.get_color()
        x = str(dominant_color).replace("(", "").replace(" ", "").replace(")", "")
        f = open("filecache", "a+")
        f.write(filename+"#"+x+"\n")
        return x

run(server="tornado",port=9000,host="0.0.0.0")