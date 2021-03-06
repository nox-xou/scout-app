
/*
  Localization, Internationalization, language files.
  Set the correct language. Read the language file.
  Update scout.dictionary. Update the UI.
*/

(function (window, $, scout, ugui) {

    /**
     * This is the basic KEY to Definition function for languages.
     *
     * @param  {string}  phrase         The KEYWORD for the dictionary to match
     * @param  {boolean} wrapInDataLang If false, we don't wrap the string in a data-lang span
     * @return {string}                 The translated text.
     */
    function localize (phrase, wrapInDataLang) {
        wrapInDataLang = wrapInDataLang || false;
        if (!phrase) {
            return 'No translation found.';
        }

        // console.log(phrase);

        var userLanguage = scout.globalSettings.cultureCode.toLowerCase();
        var translation = window.dictionary[phrase][userLanguage];

        if (wrapInDataLang) {
            return '<span data-lang="' + phrase + '">' + translation + '</span>';
        } else {
            return translation;
        }
    }

    /**
     * Detect if the text should to Left-to-Right or Right-to-Left based on culture code
     * @return {string} Returns either 'ltr' or 'rtl'
     */
    function textDirection () {
        // All RTL langs, like Hebrew (he) or Persian (fa).
        var rtlLangs = ['ar', 'fa', 'he'];
        for (var i = 0; i < rtlLangs.length; i++) {
            if (scout.globalSettings.cultureCode == rtlLangs[i]) {
                return 'rtl';
            }
        }

        return 'ltr';
    }

    /**
     * There are HTML elements that include a data-lang="KEYWORD" attribute.
     * This function updates them with the matching translation to their KEYWORD.
     */
    function updateDataLangs () {
        var dataLangs = [
            {
                'lang': 'lang',
                'attr': ''
            },
            {
                'lang': 'langalt',
                'attr': 'alt'
            },
            {
                'lang': 'langtitle',
                'attr': 'title'
            },
            {
                'lang': 'langarialabel',
                'attr': 'aria-label'
            },
            {
                'lang': 'langhref',
                'attr': 'href'
            }
        ];
        for (var i = 0; i < dataLangs.length; i++) {
            var dataLang = dataLangs[i].lang;
            var dataAttr = dataLangs[i].attr;
            var items = $('*[data-' + dataLang + ']');
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                var langKey = $(item).data(dataLang);
                if (!dataAttr) {
                    $(item).html(localize(langKey));
                } else {
                    $(item).attr(dataAttr, localize(langKey));
                }
            }
        }

        if (scout.helpers.updateProjectsFoundCount) {
            scout.helpers.updateProjectsFoundCount();
        }

        var direction = textDirection();
        var nodeLibSassVersions = '';

        if (direction == 'ltr') {
            $('body').removeClass('rtl').addClass('ltr');
            nodeLibSassVersions = '(Node-Sass v' + scout.versions.nodeSass + ' / LibSass v' + scout.versions.libSass + ')';
        } else if (direction == 'rtl') {
            $('body').removeClass('ltr').addClass('rtl');
            nodeLibSassVersions = '(v' + scout.versions.libSass + ' LibSass / v' + scout.versions.nodeSass + ' Node-Sass)';
        }

        $('.nodeSassVersion').html(nodeLibSassVersions);
        $('.chokidarVersion').html('v' + scout.versions.chokidar);

        // Allow links with a class of "external-link" to open in the user's default browser
        ugui.helpers.openDefaultBrowser();
    }

    /**
     * Loads the dictionary file from disk, converts it to JSON and stores on the
     * window object. Only ran once, on app load. The dictionary contains all
     * keys/phrases for all languages.
     */
    function loadDictionary () {
        var dictionary = ugui.helpers.readAFile('scout-files/cultures/dictionary.json');
        dictionary = JSON.parse(dictionary);
        window.dictionary = dictionary;
    }

    /**
     * Allow users to update the language of the app to match their locale.
     * @param {sting} userLanguage  Should match a .json file in the cultures folder.
     */
    function setLanguage (userLanguage) {
        userLanguage = userLanguage || 'en';
        scout.globalSettings.cultureCode = userLanguage;
        if (scout.helpers.saveSettings) {
            scout.helpers.saveSettings();
        }
        updateDataLangs();
        updateTranslatorLink();
        $('#culture-pics').attr('src', 'cultures/' + userLanguage + '.jpg');
    }

    function updateTranslatorLink () {
        var authors = localize('TRANSLATOR').split(', ');
        var urls = localize('TRANSLATOR_URL').split(', ');
        var links = '';

        for (var i = 0; i < authors.length; i++) {
            if (links) {
                links = links + ', ';
            }
            var url = urls[i];
            var author = authors[i];
            var link = '<a href="' + url + '" class="external-link">' + author + '</a>';
            links = links + link;
        }

        $('#translatorLink').html(links);
        ugui.helpers.openDefaultBrowser();
    }

    function addLanguagesToPreferences () {
        var culturesFolder = ugui.helpers.readAFolder('scout-files/cultures');
        var i = 0;
        var availableCultures = [];
        var currentFile = '';
        var culture = '';
        var option = '';
        for (i = 0; i < culturesFolder.length; i++) {
            currentFile = culturesFolder[i].name;
            if (currentFile.endsWith('.jpg') && !currentFile.startsWith('blank')) {
                availableCultures.push(currentFile.split('.jpg')[0]);
            }
        }
        for (i = 0; i < availableCultures.length; i++) {
            culture = availableCultures[i];
            option = '<option value="' + culture + '" data-lang="LANG_' + culture.toUpperCase() + '" ></option>';
            $('#cultureChoices').append(option);
        }
    }

    addLanguagesToPreferences();
    loadDictionary();
    // This will be overridden by the user's saved settings later,
    // but if they don't have saved settings, we default to English.
    setLanguage('en');

    scout.helpers.textDirection = textDirection;
    scout.helpers.setLanguage = setLanguage;
    scout.helpers.updateDataLangs = updateDataLangs;
    scout.localize = localize;

})(window, window.$, window.scout, window.ugui);
