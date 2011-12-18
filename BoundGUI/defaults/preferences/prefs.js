pref("toolkit.defaultChromeURI", "chrome://bound/content/ui/main.xul");
pref("devtools.errorconsole.enabled", true);

pref("javascript.options.showInConsole", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.strict", false); // TODO make true
pref("devtools.chrome.enabled", true);
pref("extensions.logging.enabled", true);
pref("nglayout.debug.disable_xul_fastload", true);
pref("You might also want to set dom.report_all_js_exceptions", true);

// extensions
pref("xpinstall.dialog.confirm", "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager-extensions");
pref("extensions.update.enabled", true);
pref("extensions.update.interval", 86400);
pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");
// NB these point at AMO
pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");

pref("extensions.getAddons.cache.enabled", false); // TODO: remove
