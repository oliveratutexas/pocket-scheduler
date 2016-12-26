/**
 * Get the URL of the tab that launched this popup.
 * @return A Promise that resolves to the URL.
 */
function getURL() {
    return new Promise(function(resolve, reject) {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tabs) {
            var url = null;
            for (var i = 0, tab; tab = tabs[i]; i++) {
                if (tab.url) {
                    resolve(tab.url);
                    return;
                }
            }
            reject(Error("Couldn't get active tab URL"));
        });
    });
}

/**
 * Set the popup status content to a string.
 * @param text Status string.
 */
function setStatus(text) {
    document.body.innerText = text;
}

/**
 * Report an error to the user.
 * @param err An Error object.
 */
function logError(err) {
    console.log(err);
    window.err = err;
    setStatus(err.toString() + '. ' +
        'See the "err" variable in the JS console for details.');
}

/**
 *
    Local Storage Check
    https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
*/
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

/*
 *
 */
function searchFilter(){

    var term = document.getElementById("tagSearchInput").value.toUpperCase();

}

/**
 * main popup control flow.
 */
function main() {
    if (Auth.isNeeded()) {
        setStatus('Authorizing...');
        Auth.go().catch(logError);
        // The auth flow will open a new tab, which closes this popup.
        // There's no reason to try to add a .then() to catch it.
        return;
    }

    console.log("Getting the data");

    API.list()
        .then(function(data) {

            if(storageAvailable('localStorage')){
                console.log('OH hey it works!');
            }
            else{
                alert('THERES NOT LOCAL STORAGE AVAILABLE!');
            }

            console.log("Data:");
            console.log(data);

            var tag_set = new Set();

            //filter the information to the stuff that I need.
            var all_items = data.list;
            var bag = new Map();


            //iterate through each item
            for (var prop in all_items) {

                var item = all_items[prop];

                if (item.hasOwnProperty('resolved_title') &&
                    item.hasOwnProperty('given_url') &&
                    item.hasOwnProperty('tags')) {

                    console.log(item.resolved_title);
                    console.log(item.given_url);
                    console.log(item.tags);

                    //Populate tag->[item1,item2,item3]
                    //TODO - items aren't deep copied. 
                    for (var tag in item.tags) {
                        if (bag.has(tag)) {
                            bag.get(tag).push(Object.assign({}, item));
                        } else {
                            //init array
                            bag.set(tag, [Object.assign({}, item)]);
                        }
                    }
                }
            }

            // localStorage.setItem();

        });

}

class ItemStatus extends React.Component {
    constructor(){
        super();
    }
    render(){
        return (<div></div>);
    }
}

main();
