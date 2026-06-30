chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gerarPix",
    title: "Gerar QR Code Pix para: '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gerarPix") {
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ["qrcode_min.js"] },
      () => {
        if (chrome.runtime.lastError) return;
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ["content.js"] },
          () => {
            if (chrome.runtime.lastError) return;
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, {
                action: "generate_pix",
                text: info.selectionText
              });
            }, 100);
          }
        );
      }
    );
  }
});
