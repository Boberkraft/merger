const prompts = require('prompts');

async function tryAgainInput() {
  return await prompts({
      type: 'confirm',
      name: 'tryAgain',
      message: 'Try again?'
    });
};


async function mergeInput() {
    return await prompts({
        type: 'confirm',
        name: 'merge',
        message: 'Do you want to merge PRs?'
      });
};

async function commitHeadlineInput(title) {
    return await prompts({
        type: 'text',
        name: 'commitHeadline',
        message: 'How to name commit?',
        initial: title
      });
};

module.exports.tryAgainInput = tryAgainInput;
module.exports.mergeInput = mergeInput;
module.exports.commitHeadlineInput = commitHeadlineInput;
