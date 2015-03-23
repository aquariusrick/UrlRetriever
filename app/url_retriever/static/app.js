jQuery(function($){
    window.UrlResult = Backbone.Model.extend({
        defaults: {
            url: "",
            content: "",
            selectedTag: null,
        },
    });

    window.Tag = Backbone.Model.extend({
        defaults: {
            tagName: "",
            usageCount: "",
        },
    });

    window.TagView = Backbone.View.extend({
        tagName: "li",
        className: "url_tag",

        events: {
            "click"                     : "click",
        },

        template: _.template($("#tag_summary_entry").html()),

        initialize: function() {
            _.bindAll(this, "render", "click");
        },

        click: function() {
            this.trigger("click", this.model.get('tagName'));
        },

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },

    });

    window.UrlSummaryView = Backbone.View.extend({
        el: "div.url_summary",

        events: {},

        initialize: function() {
            _.bindAll(this, "render", "tag_click");
            this.list = this.$('ul', this.$el);
            this.render();
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

        add_tag: function(data) {
            var model = new Tag(data);
            var view = new TagView({model: model});

            this.listenTo(view, "click", this.tag_click)
            this.list.append(view.render().el)
        },

        tag_click: function(e) {
            this.trigger("tag_click", e);
        },

        render: function() {
            var results = this.get_tag_matches(this.model.get('content'));
            this.list.html("");

            var tagNames = _.keys(results).sort();
            for (var i in tagNames) {
                var name = tagNames[i];
                var count = results[name];
                this.add_tag({tagName: name, usageCount: count});
            }

            return this;
        },
    });

    window.UrlResultView = Backbone.View.extend({
        el: "div.url_results",
        events: {},

        template: _.template($("#url_results").html()),

        initialize: function() {
            _.bindAll(this, "render");
            this.code_block = this.$("div.url_detail code");
            this.render();
        },

        render: function() {
//            this.code_block.text(this.model.get('content'));
            this.$el.html(this.template(this.model.attributes));
            return this;
            return this;
        },

    });

    window.AppView = Backbone.View.extend({
        el: "div#container",
        events: {
            "click    button.submit"  : "url_submit",
            "keypress #url_input"     : "on_keypress",
        },

        initialize: function() {
            _.bindAll(this, "url_submit", "url_success", "render");
            this.model = new UrlResult();
            this.input = this.$("#url_input");
            this.button = this.$("button.submit");
            this.resultView = null;
            this.summaryView = null;
        },

        on_keypress: function(e) {
          if (e.keyCode == 13) this.url_submit();
        },

        url_submit: function() {
            var url = this.input.val();
            this.model.set({url: url});
            $.get("/api/retrieve_url?url=" + encodeURIComponent(url), this.url_success);
        },

        url_success: function(data) {
            this.model.set({content: data.content});
            this.render();
        },

        highlight_tag: function(e) {
            alert("HIGHLIGHT! " + e);
            this.model.set({selectedTag: e});
            this.resultView.render();
        },

        render: function() {
            this.summaryView = new UrlSummaryView({model: this.model});
            this.resultView = new UrlResultView({model: this.model});
            this.listenTo(this.summaryView, "tag_click", this.highlight_tag);
        },
    });

    window.App = new AppView();
});