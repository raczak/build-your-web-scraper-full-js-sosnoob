var inquirer = require('inquirer');

var page = [
  {
    type: 'input',
    name: 'fromPage',
    message: 'From which page do you want to start ?',
    default: '1',
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  },
  {
    type: 'input',
    name: 'pages',
    message: 'To which page do you want to stop ?',
    default: '1',
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  }
];

var getCategory = exports.getCategory = function() {
    return inquirer.prompt(page).then(answers => {
      var arg = JSON.stringify(answers, null, '  ');
      return arg;
    });
}