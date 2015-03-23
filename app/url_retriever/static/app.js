jQuery(function($){
    window.UrlResultTag = Backbone.Model.extend({
        defaults: {
            tagName: "",
            usageCount: "",
        },
    });
    window.UrlResult = Backbone.Model.extend({
        defaults: {
            url: "",
            content: "",
        },

    });

    window.UrlSummaryView = Backbone.View.extend({
        el: "div.url_summary",

        initialize: function() {
            this.results = this.get_tag_matches(this.model.get('content'));
            alert("Summary Loaded!");
        },

        get_tag_matches: function(html_string) {
            var pattern = /<([A-Z][A-Z0-9]*)\b[^>]*>/gmi;
            var matchArray;
            var resultDict = {};

            while((matchArray = pattern.exec(html_string)) != null) {
              var tagName = matchArray[1].toUpperCase();
              if (!(tagName in resultDict))
                resultDict[tagName] = 0;
              resultDict[tagName] += 1;
            }
            console.log(resultDict);
            return resultDict;
        },
    });


    window.UrlResultView = Backbone.View.extend({
        el: "div.url_results",
        events: {},

        initialize: function() {
//            alert(this.model.attributes.content);
            this.code_block = this.$("div.url_detail code");
            this.render();
            this.summaryView = null;
        },

        render: function() {
            this.code_block.text(this.model.get('content'));
            this.summaryView = new UrlSummaryView({model: this.model})
        },

    });

//    window.UrlInputView = Backbone.View.extend({
//
//        initialize: function() {
//            _.bindAll(this, "submit");
//        },
//
//        submit: function() {
//            this.trigger("submit", {url: this.input.val()});
//        }
//    });

    window.AppView = Backbone.View.extend({
        el: "div#container",
        events: {
          "click    button.submit"  : "submit",
          "keypress #url_input"     : "updateOnEnter",
        },

        initialize: function() {
            _.bindAll(this, "submit", "success", "render");
            this.model = new UrlResult();
            this.input = this.$("#url_input");
            this.button = this.$("button.submit");
            this.resultView = null;
            this.summaryView = null;
        },

        updateOnEnter: function(e) {
          if (e.keyCode == 13) this.submit();

        },

        submit: function() {
            var url = this.input.val();
            this.model.set({url: url});
            $.get("/api/retrieve_url?url=" + encodeURIComponent(url), this.success);
        },

        success: function(data) {
//            console.log(data.content);
            this.model.set({content: data.content});
            this.render();
        },

        render: function() {
            this.resultView = new UrlResultView({model: this.model});
        }
    });

    window.App = new AppView();
});