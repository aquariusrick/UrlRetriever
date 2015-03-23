jQuery(function($){
    window.UrlResult = Backbone.Model.extend({
        defaults: {
            url: "",
            content: "",
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

        template: _.template($("#tag_summary_entry").html()),

        initialize: function() {
            _.bindAll(this, "render");
        },

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },

    });

    window.UrlSummaryView = Backbone.View.extend({
        el: "div.url_summary",

        initialize: function() {
            _.bindAll(this, "render");
            this.list = this.$('ul', this.$el);
            this.render();
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
            this.list.append(view.render().el)
        },
    });

    window.UrlResultView = Backbone.View.extend({
        el: "div.url_results",
        events: {},

        initialize: function() {
//            alert(this.model.attributes.content);
            this.code_block = this.$("div.url_detail code");
            this.render();
        },

        render: function() {
            this.code_block.text(this.model.get('content'));
        },

    });

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
            this.summaryView = new UrlSummaryView({model: this.model});
            this.resultView = new UrlResultView({model: this.model});
        }
    });

    window.App = new AppView();
});