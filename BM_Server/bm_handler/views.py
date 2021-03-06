# Create your views here.
import re
import urllib2
import json
from django.http import HttpResponse, HttpResponseBadRequest

times = {}
defaultTime = "unknown"; # Got to be the answer, right?
exception_list = [ 'https?://www\.facebook\.com.*', 'https?://www\.google\.com.*', 'https?://.*google.*' ]
readability_key = '9d801f55224d175fb6256ffac9b95f6d34f95e9a'

def get_word_count( url ):
    dat = urllib2.urlopen( 'https://www.readability.com/api/content/v1/parser?url=%s&token=%s'%( urllib2.quote(url), readability_key ) )
    d=json.loads( dat.read() )
    return d[u'word_count']

def get_time( request, url ):
    print 'Dafuq!!!!!', url

    for pat in exception_list:
        if re.match( pat, url ):
            info = { 'url': url, 'duration':  0 }
            return HttpResponse(json.dumps(info), content_type = 'application/json')
    
    youtube = re.match( '.*youtube\.com/watch\?v=(.*)', url )
    if youtube:
        print 'Youtube!!!'
        if times.has_key( url ):
            info = { 'url': url, 'duration': times[url][0] }
        else:
            vid_id = youtube.groups()[0]
            vid_info_url = 'http://gdata.youtube.com/feeds/api/videos/%s?v=2&alt=jsonc'%vid_id
            dat = urllib2.urlopen( vid_info_url ).read()
            duration = json.loads(dat)[u'data'][u'duration']

            info = { 'url': url, 'duration': duration }
            times[url] = (duration, 1)

        # TODO: Return duration.
        return HttpResponse(json.dumps(info), content_type = 'application/json')

    vimeo = re.match( '.*vimeo\.com/(.*)', url ) #39765217
    if vimeo:
        print 'Vimeo!!!'
        if times.has_key( url ):
            info = { 'url': url, 'duration': times[url][0] }
        else:
            vid_id =vimeo.groups()[0]
            vid_info_url = 'http://vimeo.com/api/v2/video/%s.json'%vid_id
            dat = urllib2.urlopen( vid_info_url ).read()
            duration = json.loads(dat)[0][u'duration']

            info = { 'url': url, 'duration': duration }
            times[url] = (duration, 1)

        # TODO: Return duration
        return HttpResponse(json.dumps(info), content_type = 'application/json')

    if times.has_key( url ):
        info = { 'url': url, 'duration': times[url][0] }
        return HttpResponse(json.dumps(info), content_type = 'application/json')
    else:
        wc = get_word_count( url )
        #info = { 'url': url, 'duration': defaultTime};
        info = { 'url': url, 'duration': wc*60/200 };
        return HttpResponse(json.dumps(info), content_type = 'application/json')

def update_time( request, url, time ):
    time = int(time)
    if times.has_key( url ):
        times[url] = ( ( times[url][0] * times[url][1] + time )*1.0/( times[url][1] + 1 ), times[url][1] + 1 )
    else:
        times[url] = ( time, 1 )
    print times
    print repr(times)
    return HttpResponse(json.dumps(times), content_type = 'application/json')
