var fs = require('fs');

var getListOfVersions = function(start, end) {
	var versions = [];

	for (var i = end; i >= start; i--) {
		versions.push(`${i}`);
	}

	return versions;
};

var config = require('../browserstack/bs-browsers.config.json');
var browserMap = {};
var browserList = [];
var essentialBrowserList = [];
var essentialBrowserCapabilityList = [];
var fullBrowserCapabilityList = [];

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
for (var os of config.operating_systems) {
	// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
	for (var browser of os.browsers) {
		if (!browser.versions) {
			var oldestVersion = browser.oldest ? browser.oldest : browser.newest - 1;
			browser.versions = getListOfVersions(oldestVersion, browser.newest);
		}

		for (var version of browser.versions) {
			if (!browser.enabled) {
				continue;
			}

			var key = `bs__${os.name.replace(' ', '-')}_${os.version.replace(' ', '-')}__${browser.name}_${version}`;
			browserList.push(key);

			var browserProfile = {
				'base': 'BrowserStack',
				'browser': browser.name,
				'os': os.name,
				'os_version': os.version,
				'browserstack.local': true
			};

			if (browser.specs) {
				browserProfile.specs = browser.specs;
			}

			if (browser['browserstack.selenium_version']) {
				browserProfile['browserstack.selenium_version'] = browser['browserstack.selenium_version'];
			}

			// If it is essential and the latest version add to essential list
			if (browser.essential) {
				var essentialKey = `bs__${os.name.replace(' ', '-')}_${os.version.replace(' ', '-')}__${browser.name}_Latest`;
				essentialBrowserList.push(essentialKey);
				browserList.push(key);
				if (!browserMap[essentialKey]) {
					browserMap[essentialKey] = browserProfile;
					essentialBrowserCapabilityList.push(browserProfile);
				}
			}

			var fullProfile = Object.assign({}, browserProfile, {'browser_version': version});

			fullBrowserCapabilityList.push(fullProfile);
			browserMap[key] = fullProfile;
		}
	}
}

var content = JSON.stringify(browserMap);

fs.writeFile('browserstack/bs-customLaunchers.json', content, function(err) {
	if (err) {
		console.error(err);
	}
});

fs.writeFile('browserstack/bs-customLaunchers.essential.json', JSON.stringify({browsers: essentialBrowserCapabilityList}), function(err) {
	if (err) {
		console.error(err);
	}
});

fs.writeFile('browserstack/bs-customLaunchers.all.json', JSON.stringify({browsers: fullBrowserCapabilityList}), function(err) {
	if (err) {
		console.error(err);
	}
});

fs.writeFile(`browserstack/bs-browerList.json`, JSON.stringify({browsers: browserList}), function(err) {
	if (err) {
		console.error(err);
	}
});

fs.writeFile(`browserstack/bs-browerList-essential.json`, JSON.stringify({browsers: essentialBrowserList}), function(err) {
	if (err) {
		console.error(err);
	}
});
