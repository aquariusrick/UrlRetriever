# UrlRetriever

http://rick-garlick.appspot.com/url_retriever/

0. Users can enter a URL of a page to fetch
0. The web app fetches the HTML of the page and displays the source to the user
0. A summary of the document is displayed, listing which tags are present in the HTML and how many of each tag
0. Clicking on the name of each tag in the summary will highlight the tags in the source code view

# Google App Engine
Use the following command to deploy:


# Added Coffee Script!
Use the following command to compile (and watch for changes):
coffee -o app/url_retriever/static -cw app/url_retriever/app.coffee

Need to add Verification on the URL entry
Need to refactor the code to be more application like
Disable the button while the url is being fetched
Add Routing
Mobile!!!!
