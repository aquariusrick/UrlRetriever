import webapp2
# import jinja2
# import os
import urllib2
import json
import logging as log

# JINJA_ENVIRONMENT = jinja2.Environment(
#     loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
#     extensions=['jinja2.ext.autoescape'],
#     autoescape=True)


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
            log.info("REQUEST COMPLETE: \n%s", content)
        except urllib2.URLError, e:
            log.error(e.message)

        # template_values = {}
        # template = JINJA_ENVIRONMENT.get_template('index.html')
        # self.response.write(template.render(template_values))

application = webapp2.WSGIApplication([
    ('/api/retrieve_url/?$', UrlRetriever),
    ], debug=True)


