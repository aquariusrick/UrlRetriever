jQuery(function($){
    // The data model shared by the application and the result views.
    window.UrlResult = Backbone.Model.extend({
        defaults: {
            url: "",
            content: "",
            selectedTag: null,
        },
    });

    // Model for each tag in the summary view.
    window.Tag = Backbone.Model.extend({
        defaults: {
            tagName: "",
            usageCount: "",
            isSelected: false,
        },
    });

    // View for each tag in the summary view.
    window.TagView = Backbone.View.extend({
        events: {
            click: "click",
        },

        template: _.template($("#tag_summary_entry").html()),

        initialize: function() {
            _.bindAll(this, "render", "click");
        },

        click: function() {
            this.trigger("click", this.model.get('tagName'));
        },

        render: function() {
            var html = this.template(this.model.attributes);
            this.setElement($(html));
            return this;
        },

    });

    // Summary view
    window.UrlSummaryView = Backbone.View.extend({
        el: "div.url_summary",

        events: {},

        initialize: function() {
            _.bindAll(this, "render", "tag_click", "add_tag");
            this.list = this.$('ul', this.$el);
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
            return resultDict;
        },

        add_tag: function(data) {
            var model = new Tag(data);
            var selectedTag = this.model.get("selectedTag");
            if (selectedTag == model.get("tagName"))
                model.set("isSelected", true);
            var view = new TagView({model: model});

            this.listenTo(view, "click", this.tag_click)
            this.list.append(view.render().el)
        },

        tag_click: function(e) {
            this.trigger("tag_click", e);
        },

        render: function() {
            this.list.html("");
            var results = this.get_tag_matches(this.model.get('content'));

            var tagNames = _.keys(results).sort();
            for (var i in tagNames) {
                var name = tagNames[i];
                var count = results[name];
                this.add_tag({tagName: name, usageCount: count});
            }

            return this;
        },
    });

    // Code View
    window.UrlResultView = Backbone.View.extend({
        el: "div.url_detail",
        events: {},

        template: _.template($("#url_detail").html()),

        initialize: function() {
            _.bindAll(this, "render");
        },

        render: function() {
            var selectedTag = this.model.get('selectedTag');

            var content = _.escape(this.model.get("content"));
            if (selectedTag)
                content = this.highlight_tags(content);

            this.model.set("display_content", content);

            this.$el.html(this.template(this.model.attributes));
            return this;
        },

        highlight_tags: function(searchString) {
            var tagName = this.model.get('selectedTag');

            //var pattern = /</\b[^>]*>/gmi
            var pattern = "&lt;/?" + tagName + "\\b.*?&gt;"
            var re = new RegExp(pattern,"gmi");

            var matchArray;
            var resultString = "";
            var first=0; var last=0;

            // find each match
            while((matchArray = re.exec(searchString)) != null) {
                last = matchArray.index;
                // get all of string up to match, concatenate
                resultString += searchString.substring(first, last);

                // add matched, with class
                resultString += "<span class='found'>" + matchArray[0] + "</span>";
                first = re.lastIndex;
            }

            // finish off string
            resultString += searchString.substring(first,searchString.length);
            return resultString;
        },
    });

    // Main application
    window.AppView = Backbone.View.extend({
        // There are 2 actions the user can take: 1. submit a new URL; 2. Click on a tag for highlighting.
        // The application listens for these events to occur and handles them by updating the shared model data,
        // and then calling render on the views.

        el: "div#container",

        events: {
            "click    button.submit"  : "url_submit",
            "keypress #url_input"     : "on_keypress",
        },

        initialize: function() {
            _.bindAll(this, "url_submit", "url_success", "render", "on_keypress", "highlight_tag");

            this.model = new UrlResult();
            this.input = this.$("#url_input");
            this.button = this.$("button.submit");

            this.summaryView = new UrlSummaryView({model: this.model});
            this.resultView = new UrlResultView({model: this.model});

            this.listenTo(this.summaryView, "tag_click", this.highlight_tag);
            this.input.val(window.location);
        },

        // For pressing enter in the url box
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
            this.model.set("selectedTag", null);
            this.render();
        },

        highlight_tag: function(e) {
            this.model.set({selectedTag: e});
            this.render();
        },

        render: function() {
            this.summaryView.render();
            this.resultView.render();
            return this;
        },
    });

    window.App = new AppView();
});