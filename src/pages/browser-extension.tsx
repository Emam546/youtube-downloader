import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChrome, faEdge, faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faDownload,
  faFolderOpen,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { NextPageWithSpecialComponent } from "./_app";
import PlayList from "@src/components/playlist";
import TypeApplication from "@src/components/common/TypeApllication";

function BrowserExtensionContent() {
  const [extensionPath, setExtensionPath] = useState<string>("");
  const [selectedBrowser, setSelectedBrowser] = useState<string>("chrome");

  useEffect(() => {
    const fetchExtensionPath = async () => {
      try {
        if (window.api && window.api.invoke) {
          const path = await window.api.invoke("getExtensionPath");
          setExtensionPath(path);
        }
      } catch (error) {
        // Failed to get extension path
      }
    };
    fetchExtensionPath();
  }, []);

  const handleOpenExtensionFolder = () => {
    if (window.api && window.api.send) {
      window.api.send("openExtensionFolder");
    }
  };

  const handleOpenBrowserExtensions = () => {
    if (window.api && window.api.send) {
      window.api.send("openBrowserExtensionsPage", selectedBrowser);
    }
  };

  return (
    <div className="container tw-py-10">
      {/* <div className="tw-p-6 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200"> */}
      <div className="tw-text-center">
        <h1 className="tw-text-3xl tw-font-semibold tw-mb-4 tw-text-primary">
          Browser Extension
        </h1>
        <p className="tw-text-gray-600 tw-mb-6 tw-text-lg">
          Download videos directly from your browser using the YouTube
          Downloader extension. The extension adds a download button to
          YouTube, Facebook, and Instagram pages.
        </p>

        <TypeApplication defaultState={false} env="desktop">
          <div className="tw-mb-6 tw-max-w-md tw-mx-auto">
            <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
              Select Browser
            </label>
            <div className="tw-flex tw-justify-center tw-gap-4">
              <button
                onClick={() => setSelectedBrowser("chrome")}
                className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-border ${
                  selectedBrowser === "chrome"
                    ? "tw-bg-primary tw-text-white tw-border-primary"
                    : "tw-bg-white tw-text-gray-700 tw-border-gray-300 hover:tw-border-primary"
                }`}
              >
                <FontAwesomeIcon icon={faChrome} />
                Chrome
              </button>
              <button
                onClick={() => setSelectedBrowser("edge")}
                className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-border ${
                  selectedBrowser === "edge"
                    ? "tw-bg-primary tw-text-white tw-border-primary"
                    : "tw-bg-white tw-text-gray-700 tw-border-gray-300 hover:tw-border-primary"
                }`}
              >
                <FontAwesomeIcon icon={faEdge} />
                Edge
              </button>
            </div>
          </div>

          <div className="tw-flex tw-justify-center tw-gap-4 tw-mb-6 tw-flex-wrap">
            <button
              onClick={handleOpenBrowserExtensions}
              className="tw-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-red-600 tw-transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} />
              Open {selectedBrowser === "chrome" ? "Chrome" : "Edge"} Extensions
            </button>
            <button
              onClick={handleOpenExtensionFolder}
              className="tw-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300 tw-rounded-lg hover:tw-border-primary hover:tw-text-primary tw-transition-colors"
            >
              <FontAwesomeIcon icon={faFolderOpen} />
              Open Extension Folder
            </button>
          </div>

          <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-4 tw-mt-4 tw-max-w-2xl tw-mx-auto tw-text-left">
            <div className="tw-flex tw-items-start tw-gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="tw-text-yellow-600 tw-mt-1"
              />
              <div>
                <h4 className="tw-font-semibold tw-text-yellow-800 tw-mb-1">
                  Installation Instructions
                </h4>
                <ol className="tw-text-sm tw-text-yellow-700 tw-space-y-1 tw-list-decimal tw-list-inside">
                  <li>
                    Click &ldquo;Open{" "}
                    {selectedBrowser === "chrome" ? "Chrome" : "Edge"}{" "}
                    Extensions&rdquo; above
                  </li>
                  <li>
                    Enable &ldquo;Developer Mode&rdquo; in the top right corner
                  </li>
                  <li>Click &ldquo;Load unpacked&rdquo; button</li>
                  <li>
                    Navigate to the extension folder that opens when you click
                    &ldquo;Open Extension Folder&rdquo;
                  </li>
                  <li>Select the folder and the extension will be installed</li>
                </ol>
              </div>
            </div>
          </div>

          {extensionPath && (
            <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
              Extension location:{" "}
              <code className="tw-bg-gray-200 tw-px-2 tw-py-1 tw-rounded">
                {extensionPath}
              </code>
            </p>
          )}
        </TypeApplication>

        <TypeApplication defaultState={false} env="web">
          <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-6 tw-mt-4 tw-max-w-2xl tw-mx-auto tw-text-left">
            <div className="tw-flex tw-items-start tw-gap-3">
              <FontAwesomeIcon
                icon={faGithub}
                className="tw-text-blue-600 tw-mt-1 tw-text-2xl"
              />
              <div>
                <h4 className="tw-font-semibold tw-text-blue-800 tw-mb-2 tw-text-lg">
                  Download Extension
                </h4>
                <p className="tw-text-sm tw-text-blue-700 tw-mb-4">
                  To install the browser extension, download it from GitHub and
                  load it in your browser:
                </p>
                <ol className="tw-text-sm tw-text-blue-700 tw-space-y-2 tw-list-decimal tw-list-inside tw-mb-4">
                  <li>
                    Visit the{" "}
                    <a
                      href="https://github.com/Emam546/youtube-downloader-browser-extension/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tw-text-primary hover:tw-underline tw-font-medium"
                    >
                      GitHub Releases page
                    </a>
                  </li>
                  <li>Download the Chrome extension (.zip file)</li>
                  <li>Extract the downloaded zip file</li>
                  <li>Open your browser&rsquo;s extensions page</li>
                  <li>Enable &ldquo;Developer Mode&rdquo;</li>
                  <li>Click &ldquo;Load unpacked&rdquo;</li>
                  <li>Select the extracted folder</li>
                </ol>
                <a
                  href="https://github.com/Emam546/youtube-downloader-browser-extension/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-red-600 tw-transition-colors"
                >
                  <FontAwesomeIcon icon={faGithub} />
                  Download from GitHub
                </a>
              </div>
            </div>
          </div>
        </TypeApplication>
      </div>
      {/* </div> */}
    </div>
  );
}

export const Page: NextPageWithSpecialComponent = function () {
  return (
    <>
      <BrowserExtensionContent />
    </>
  );
};
Page.hideInput = true;
Page.getLayout = function () {
  return (
    <>
      <PlayList />
    </>
  );
};

export default Page;
