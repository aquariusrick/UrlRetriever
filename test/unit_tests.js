module("Model test", {
    setup: function(){
        this.App = new AppView()
    }
});
test("Submitting new URL updates model", function testSubmitUrl() {
    ok(this.App.model, "App model is accessible");

    jQuery('input#url_input').val("http://yahoo.com");
    jQuery('.url_input button').click();
    equal(this.App.model.get("url"), "http://yahoo.com", "Url was updated on model");
});

test("Successful url response builds a tag summary", function testUrlSummary() {
    var testHtml = '<html><div class="none"></div><div><div></div></div><footer></footer></html>';

    this.App.model.set("url", "http://localhost", {silent: true});
    this.App.url_success({content: testHtml});
    equal(this.App.model.get("content"), testHtml, "Content was updated on model");

    ok(this.App.summaryView, "URL Summary is Accessible");
    var tags = this.App.summaryView.list.children();
    equal(tags.length, 3, "Found 3 different tags");
    equal(tags[0].textContent, "DIV - 3", "Found 3 DIV tags");
    equal(tags[1].textContent, "FOOTER - 1", "Found 1 FOOTER tag");
    equal(tags[2].textContent, "HTML - 1", "Found 1 HTML tag");
});