let common = require("../helpers/Common.js");
let Storage = require("../helpers/Storage.js");
let ChromeStorageLocal = require("../helpers/ChromeStorageLocal.js");
let Const = require("../helpers/Const.js");

let local_stored_data = {};

$(() => {
    setVersionType();

    $("#chatpp_version").html(common.getAppFullName());

    let pages = ["setting", "emoticon", "room", "group", "shortcut", "change_logs", "features", "notification"];
    pages.forEach((page_name) => {
        let url = `html/${page_name}.html`;
        $(`#${page_name}_page`).click(() => {
            common.openNewUrl(url);
        });
    });

    $(".ext-url").click((e) => {
        common.openNewUrl($(e.currentTarget).attr("href"));
    });

    chrome.storage.onChanged.addListener((changes) => {
        let data = changes[Const.CHROME_SYNC_KEY];
        if (!$.isEmptyObject(data) && !$.isEmptyObject(data.newValue)) {
            data = data.newValue;
            updateViewData(data);
        }
    });

    loadChatppEmoData();
});

function loadStatus(name, value) {
    if (value !== undefined && (value === false || value === "false")) {
        $(`#${name}-status`).removeClass().addClass("text-danger").html("DISABLED");
    } else {
        $(`#${name}-status`).removeClass().addClass("text-primary").html("ENABLED");
    }
}

function loadChatppEmoData() {
    let storage = new Storage;
    storage.get(Const.CHROME_SYNC_KEY, (data) => {
        if ($.isEmptyObject(data)) {
            common.openNewExtensionPageUrl(common.app_detail.options_page);
        } else {
            updateViewData(data);
        }
    });
}

function updateViewData(data) {
    let features = ["emoticon", "mention", "shortcut"];
    for (let i in features) {
        loadStatus(features[i], data[`${features[i]}_status`]);
    }
}

function setVersionType() {
    let chrome_storage_local = new ChromeStorageLocal();
    chrome_storage_local.get((data) => {
        if ($.isEmptyObject(data)) {
            local_stored_data = {};
        } else {
            local_stored_data = data;
        }
        if (local_stored_data[Const.CHROME_LOCAL_KEY] === undefined) {
            local_stored_data[Const.CHROME_LOCAL_KEY] = {};
        }
        local_stored_data[Const.CHROME_LOCAL_KEY]["version"] = common.getAppVersion();
        local_stored_data[Const.CHROME_LOCAL_KEY]["version_name"] = common.getAppVersionName();
        chrome.action.getBadgeText({}, (result) => {
            if (result === "new") {
                chrome.action.setBadgeText({text: ""});
                common.openNewUrl("html/change_logs.html");
            }
        });
        chrome_storage_local.setData(local_stored_data);
    });
}
