var fs = require('fs');
var request = require('request-promise');
var cheerio = require('cheerio');

var CLI = require('clui'),
    Progress = CLI.Progress;

var currentPosition = 0;
var progressbarPosition = 0;
var itemsList = [];
var thisProgressBar = new Progress(20);
var requestOpts = {
    url: '',
    transform: function (body) {
        return cheerio.load(body);
    }
};

var getItems = exports.getItems = function(links, back) {
	getData(links[currentPosition],back, function(item){
		itemsList.push(item);
		if (progressbarPosition >= links.length * 0.05) {
			progressbarPosition = 0;
			console.log(thisProgressBar.update(currentPosition, links.length));
		}
		progressbarPosition++;
		currentPosition++;
        if(currentPosition < links.length) { // any more items in array?
         	getItems(links, back);   
        }else {
        	console.log(thisProgressBar.update(100, 100));
			back(itemsList);
		}
	});
};

function getData(url, back, callback) {
	requestOpts.url = url;
	var itemPromise = request(requestOpts).then(function ($) {
		var itemId = $('h1.public').text().trim();
		var name = $('div.repository-content').find('div.repository-meta').eq(0).text().trim();
		
		var item = {
			item_identifiant: itemId,
			name: name,
			url: url
		}
		
		item["labels"] = [];
		$('div.repository-topics-container').find('div.list-topics-container.f6.mt-1').eq(0).find('a').each(function(i, element){
			var label = $(this).text().trim();
			item["labels"].push(label);
		});
		return item;
	});

	itemPromise.then(function(item) {
    	callback(item);
    }).catch(function(err) {
        if (err.statusCode == '404') {
        	console.log('\x1b[33m%s\x1b[0m' ,'\n Error 404 detected ! Maybe empty item (Encyclopedia error).');
        	callback();
        }else if(err.statusCode == '429') {
        	console.log('\x1b[31m%s\x1b[0m' ,'\n /!\\ Error 429 detected ! Too many request, be careful Github can ban your IP. /!\\ Never parse more than 20 pages/hour');
        	process.exit();
        }else {
        	console.log(err);
        	console.log('\x1b[31m%s\x1b[0m' ,'/!\\Broken promise all');
        	process.exit();
        }
      });
}
