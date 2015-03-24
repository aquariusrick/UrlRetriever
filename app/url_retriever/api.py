import webapp2
import urllib2
import json
import logging as log


class UrlRetriever(webapp2.RequestHandler):
    def get(self):
        try:
            self.response.headers['Content-Type'] = 'application/json'
            url = self.request.GET['url']
            log.info("REQUEST STARTING FOR URL: [%s]", url)
            prefixes = ("http://", "https://")
            if not any([url[:len(prefix)] == prefix for prefix in prefixes]):
                url = prefixes[0] + url

            result = urllib2.urlopen(url)
            content = "".join(result.fp.readlines())
            self.response.out.write(json.dumps({'content': content}))
            log.info("REQUEST COMPLETE!")
            log.debug(content)
        except urllib2.URLError, e:
            log.error(e.message)

application = webapp2.WSGIApplication([
    ('/url_retriever/api/retrieve_url/?$', UrlRetriever),
    ], debug=True)


