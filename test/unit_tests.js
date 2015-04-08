QUnit.module("Unit Test", {
    setup: function(){
        this.App = window.App;
        this.App.reset();
    }
});
QUnit.test("Blank or invalid Url show error message", function testInvalidUrl(assert){
    var urlBlankError = "Url cannot be blank!",
        urlInvalidError = "Url is invalid!";

    assert.ok(this.App.model, "App model is accessible");
    this.App.$input.val("");
    var button = jQuery('.url_input button');
    button.click();
    assert.equal(this.App.model.get("errorMessage"), urlBlankError, "Url Blank Message set on Model.");
    assert.notOk(this.App.model.get('url'), "Url is not set.");

    // Clear error message
    this.App.model.set('errorMessage', null, {silent: true});

    this.App.$input.val("www");
    button.click();
    assert.equal(this.App.model.get('url'), 'www', 'Url is set.');
    setTimeout(function errorMessageCheck(done){
        var $errorMessage = $('.message', this.App.errorMessageView.el);
        assert.equal(this.App.model.get("errorMessage"), urlInvalidError, "Invalid Url Message set on Model.");
        assert.equal($errorMessage.text(), urlInvalidError, "Error message shows Invalid Url Message.");
        done();
    }.bind(this, assert.async()), 500);
});

QUnit.test("Error Message goes away after successful Url request.", function testErrorRemovesAfterSuccessfulUrl(assert) {
    this.App.$input.val("");
    var button = jQuery('.url_input button');
    button.click();
    assert.ok(this.App.model.get('errorMessage'), 'An error message is set.')
    var testHtml = '<html><div class="none"></div><div><div></div></div><footer></footer></html>';
    this.App.url_success({content: testHtml});
    assert.equal(this.App.model.get('content'), testHtml, "Content was updated on model");
    assert.notOk(this.App.model.get('errorMessage'), 'No error message is set.')
});

QUnit.module("Functional Test", {
    setup: function(){
        this.App = window.App;
        this.App.reset();
    }
});
QUnit.test("Submitting new URL shows summary and detail; clicking tag highlights tag and source text.", function testSubmitUrl(assert) {
    assert.ok(this.App.model, "App model is accessible");

    jQuery('input#url_input').val("http://yahoo.com");
    jQuery('.url_input button').click();
    assert.equal(this.App.model.get("url"), "http://yahoo.com", "Url was updated on model");

    var testHtml = '<html><div class="none"></div><div><div></div></div><footer></footer></html>';
    assert.notEqual(this.App.model.get("content"), testHtml, "Content is not yet on the model");
    this.App.url_success({content: testHtml});
    assert.equal(this.App.model.get("content"), testHtml, "Content was updated on model");

    assert.ok(this.App.summaryView, "URL Summary is Accessible");
    var tags = this.App.summaryView.list.children();
    assert.equal(tags.length, 3, "Found 3 different tags");
    assert.equal(tags[0].textContent, "DIV - 3", "Found 3 DIV tags");
    assert.equal(tags[1].textContent, "FOOTER - 1", "Found 1 FOOTER tag");
    assert.equal(tags[2].textContent, "HTML - 1", "Found 1 HTML tag");

    assert.ok(this.App.resultView, "URL Detail is Accessible");
    var code = this.App.model.get('display_content')
    var expected = this.App.resultView.highlight_tags(this.App.model.get("content"), this.App.model.get('selectedTag'));
    assert.equal(expected, code, "Code in the result code box matched as expected");

    results = [
        "&lt;html&gt;<span class='found'>&lt;div class=&quot;none&quot;&gt;</span><span class='found'>&lt;/div&gt;</span><span class='found'>&lt;div&gt;</span><span class='found'>&lt;div&gt;</span><span class='found'>&lt;/div&gt;</span><span class='found'>&lt;/div&gt;</span>&lt;footer&gt;&lt;/footer&gt;&lt;/html&gt;",
        "&lt;html&gt;&lt;div class=&quot;none&quot;&gt;&lt;/div&gt;&lt;div&gt;&lt;div&gt;&lt;/div&gt;&lt;/div&gt;<span class='found'>&lt;footer&gt;</span><span class='found'>&lt;/footer&gt;</span>&lt;/html&gt;",
        "<span class='found'>&lt;html&gt;</span>&lt;div class=&quot;none&quot;&gt;&lt;/div&gt;&lt;div&gt;&lt;div&gt;&lt;/div&gt;&lt;/div&gt;&lt;footer&gt;&lt;/footer&gt;<span class='found'>&lt;/html&gt;</span>",
    ]
    var clickTest = function clickTest(i) {
        if (i >= tags.length)
            return;

        var done = assert.async(),
            tag = $(this.App.summaryView.list.children()[i]);

        tag.click();
        setTimeout(function clickTestTimeout() {
            tag = $(this.App.summaryView.list.children()[i]);
            assert.ok(tag.hasClass("selected"), "Tag " + (i + 1) + " is selected");
            assert.equal(this.App.model.get('display_content'), results[i], "Tag " + (i + 1) + " Url Detail Highlighting is correct!");
            done();
            clickTest.call(this, i + 1);
        }.call(this), 500);
    }

    clickTest.call(this, 0);
});

