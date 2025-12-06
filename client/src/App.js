import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// Check if running in Electron
const isElectron =
  window && window.process && window.process.type === "renderer";

function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [messages, setMessages] = useState([]);

  // Preset lists
  const [textPresets, setTextPresets] = useState([]);
  const [imagePresets, setImagePresets] = useState([]);
  const [sendingPresets, setSendingPresets] = useState(false);
  const textAreaRef = useRef(null);

  // Clipboard monitoring (Electron only)
  const [showClipboardHistory, setShowClipboardHistory] = useState(false);
  const [clipboardHistory, setClipboardHistory] = useState([]);

  useEffect(() => {
    fetchMessages();
    loadPresetsFromStorage();

    // Setup Electron IPC listeners
    if (isElectron && window.require) {
      const { ipcRenderer } = window.require("electron");

      // Listen for clipboard updates
      ipcRenderer.on("clipboard-update", (event, data) => {
        console.log("Clipboard updated:", data);
        showAlert(
          "info",
          `Clipboard: ${
            data.type === "text" ? data.content.substring(0, 30) : "Image"
          }`
        );
      });

      // Listen for clipboard history request
      ipcRenderer.on("show-clipboard-history", () => {
        setShowClipboardHistory(true);
        // Request clipboard history from main process
        ipcRenderer.send("get-clipboard-history");
      });

      // Receive clipboard history
      ipcRenderer.on("clipboard-history-response", (event, history) => {
        setClipboardHistory(history);
      });

      return () => {
        ipcRenderer.removeAllListeners("clipboard-update");
        ipcRenderer.removeAllListeners("show-clipboard-history");
        ipcRenderer.removeAllListeners("clipboard-history-response");
      };
    }
  }, []);

  // Load presets from localStorage
  const loadPresetsFromStorage = () => {
    try {
      const savedTextPresets = localStorage.getItem("textPresets");
      const savedImagePresets = localStorage.getItem("imagePresets");

      if (savedTextPresets) {
        setTextPresets(JSON.parse(savedTextPresets));
      }
      if (savedImagePresets) {
        setImagePresets(JSON.parse(savedImagePresets));
      }
    } catch (error) {
      console.error("Error loading presets:", error);
    }
  };

  // Save presets to localStorage
  const savePresetsToStorage = (texts, images) => {
    try {
      localStorage.setItem("textPresets", JSON.stringify(texts));
      localStorage.setItem("imagePresets", JSON.stringify(images));
    } catch (error) {
      console.error("Error saving presets:", error);
    }
  };

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setImages((prev) => [...prev, blob]);
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(blob);
            showAlert("success", "Image pasted from clipboard!");
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("/api/messages");
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 5000);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showAlert("error", `${file.name} exceeds 10MB limit`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImages((prevImages) => [...prevImages, ...validFiles]);
          setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const removeAllImages = () => {
    setImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && images.length === 0) {
      showAlert("error", "Please enter text or select images");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", text.trim() || "Multiple images");

      // Add all images to the same request
      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert(
        "success",
        `Successfully stored ${text.trim() ? "1 text + " : ""}${
          images.length
        } image(s)!`
      );
      setText("");
      setImages([]);
      setImagePreviews([]);
      fetchMessages();
    } catch (error) {
      console.error("Error storing message:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to store message. Please try again.";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add current text/image to preset lists
  const addToPresets = () => {
    if (!text.trim() && images.length === 0) {
      showAlert(
        "error",
        "Please enter text or select images to add to presets"
      );
      return;
    }

    const newTextPresets = text.trim() ? [...textPresets, text] : textPresets;
    let newImagePresets = [...imagePresets];

    images.forEach((img, index) => {
      newImagePresets.push({
        name: img.name,
        preview: imagePreviews[index],
        file: img,
      });
    });

    setTextPresets(newTextPresets);
    setImagePresets(newImagePresets);
    savePresetsToStorage(
      newTextPresets,
      newImagePresets.map((img) => ({ name: img.name, preview: img.preview }))
    );

    showAlert("success", "Added to presets!");
    setText("");
    setImages([]);
    setImagePreviews([]);
  };

  // Remove preset
  const removeTextPreset = (index) => {
    const newPresets = textPresets.filter((_, i) => i !== index);
    setTextPresets(newPresets);
    savePresetsToStorage(
      newPresets,
      imagePresets.map((img) => ({ name: img.name, preview: img.preview }))
    );
  };

  const removeImagePreset = (index) => {
    const newPresets = imagePresets.filter((_, i) => i !== index);
    setImagePresets(newPresets);
    savePresetsToStorage(
      textPresets,
      newPresets.map((img) => ({ name: img.name, preview: img.preview }))
    );
  };

  // Send single text preset
  const sendSingleTextPreset = async (textMsg, index) => {
    try {
      const formData = new FormData();
      formData.append("text", textMsg);

      await axios.post("/api/messages", formData);
      showAlert("success", "Message stored successfully!");

      // Remove from presets after successful send
      removeTextPreset(index);
      fetchMessages();
    } catch (error) {
      console.error("Error storing text preset:", error);
      showAlert("error", "Failed to store message");
    }
  };

  // Copy single text to clipboard
  const copySingleText = async (textMsg) => {
    try {
      await navigator.clipboard.writeText(textMsg);
      showAlert("success", "✅ Text copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", "Failed to copy");
    }
  };

  // Paste single text to current text field
  const pasteSingleText = (textMsg) => {
    setText(textMsg);
    showAlert("success", "✅ Text pasted to input field!");
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  // Send single image preset
  const sendSingleImagePreset = async (imgData, index) => {
    try {
      const formData = new FormData();
      formData.append("text", imgData.name || "Image");

      // Convert data URL back to blob if needed
      if (imgData.file) {
        formData.append("images", imgData.file);
      } else if (imgData.preview) {
        const response = await fetch(imgData.preview);
        const blob = await response.blob();
        formData.append("images", blob, imgData.name);
      }

      await axios.post("/api/messages", formData);
      showAlert("success", "Image stored successfully!");

      // Remove from presets after successful send
      removeImagePreset(index);
      fetchMessages();
    } catch (error) {
      console.error("Error storing image preset:", error);
      showAlert("error", "Failed to store image");
    }
  };

  // Copy image name to clipboard
  const copySingleImage = async (imgData) => {
    try {
      // Copy actual image data to clipboard (Electron only)
      if (isElectron && window.require) {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("copy-to-clipboard", {
          type: "image",
          content: imgData.preview, // Send the data URL
        });
        showAlert("success", "✅ Image copied to clipboard!");
      } else {
        // Fallback for web - copy image name
        await navigator.clipboard.writeText(imgData.name);
        showAlert("success", "✅ Image name copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", "Failed to copy");
    }
  };

  // Copy and auto-paste image
  const copyAndPasteImage = async (imgData) => {
    try {
      if (isElectron && window.require) {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("copy-and-paste", {
          type: "image",
          content: imgData.preview,
        });
        showAlert("success", "✅ Copied! Press Ctrl+V in other window");
      } else {
        showAlert("error", "Auto-paste only works in Electron app");
      }
    } catch (error) {
      console.error("Failed to copy and paste:", error);
      showAlert("error", "Failed to copy and paste");
    }
  };

  // Copy and auto-paste text
  const copyAndPasteText = async (textMsg) => {
    try {
      if (isElectron && window.require) {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("copy-and-paste", {
          type: "text",
          content: textMsg,
        });
        showAlert("success", "✅ Copied! Press Ctrl+V in other window");
      } else {
        // Fallback for web
        await navigator.clipboard.writeText(textMsg);
        showAlert("success", "✅ Copied! Press Ctrl+V to paste");
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", "Failed to copy");
    }
  };

  // Paste single image to current image field
  const pasteSingleImage = (imgData) => {
    if (imgData.file) {
      setImages((prev) => [...prev, imgData.file]);
      setImagePreviews((prev) => [...prev, imgData.preview]);
      showAlert("success", "✅ Image pasted to input field!");
    } else {
      showAlert("error", "Image file not available");
    }
  };

  // Send all presets
  const sendAllPresets = async () => {
    if (textPresets.length === 0 && imagePresets.length === 0) {
      showAlert("error", "No presets to store");
      return;
    }

    setSendingPresets(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Send all text presets
      for (const textMsg of textPresets) {
        try {
          const formData = new FormData();
          formData.append("text", textMsg);

          await axios.post("/api/messages", formData);
          successCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between messages
        } catch (error) {
          console.error("Error storing text preset:", error);
          failCount++;
        }
      }

      // Send all image presets
      for (const imageData of imagePresets) {
        try {
          const formData = new FormData();
          formData.append("text", imageData.name || "Image");

          // Convert data URL back to blob if needed
          if (imageData.file) {
            formData.append("images", imageData.file);
          } else if (imageData.preview) {
            const response = await fetch(imageData.preview);
            const blob = await response.blob();
            formData.append("images", blob, imageData.name);
          }

          await axios.post("/api/messages", formData);
          successCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between messages
        } catch (error) {
          console.error("Error storing image preset:", error);
          failCount++;
        }
      }

      showAlert(
        "success",
        `Stored ${successCount} messages successfully${
          failCount > 0 ? `, ${failCount} failed` : ""
        }!`
      );

      // Clear presets after successful send
      if (failCount === 0) {
        setTextPresets([]);
        setImagePresets([]);
        savePresetsToStorage([], []);
      }

      fetchMessages();
    } catch (error) {
      showAlert("error", "Error storing presets");
    } finally {
      setSendingPresets(false);
    }
  };

  // Clear all presets
  const clearAllPresets = () => {
    setTextPresets([]);
    setImagePresets([]);
    savePresetsToStorage([], []);
    showAlert("info", "All presets cleared");
  };

  // Copy all presets to clipboard
  const copyPresetsToClipboard = async () => {
    if (textPresets.length === 0 && imagePresets.length === 0) {
      showAlert("error", "No presets to copy");
      return;
    }

    let clipboardText = "";

    // Add text messages (one per line)
    textPresets.forEach((text) => {
      clipboardText += `${text}\n`;
    });

    // Add image names
    imagePresets.forEach((img) => {
      clipboardText += `${img.name}\n`;
    });

    try {
      await navigator.clipboard.writeText(clipboardText.trim());
      showAlert("success", "✅ Copied to clipboard! Paste in notepad or blog.");
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", "Failed to copy to clipboard");
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📦 Warehouse Message</h1>
        <p>Clipboard monitoring and message storage</p>
      </header>

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <form className="messenger-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="text">Message Text *</label>
          <textarea
            ref={textAreaRef}
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your message here..."
            required
          />
        </div>

        <div className="form-group">
          <label>Image (optional)</label>
          <div className="file-input-wrapper">
            <label
              className={`file-input-label ${
                images.length > 0 ? "has-file" : ""
              }`}
              htmlFor="image"
            >
              📷{" "}
              {images.length > 0
                ? `${images.length} Image(s) Selected`
                : "Choose Images (Multiple)"}
            </label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              multiple
            />
          </div>
          {images.length > 0 && (
            <div className="file-name">
              Selected: {images.map((img) => img.name).join(", ")}
            </div>
          )}
        </div>

        {imagePreviews.length > 0 && (
          <div className="image-preview">
            <div className="multiple-images-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-single-image"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="remove-image"
              onClick={removeAllImages}
            >
              Remove All Images
            </button>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading && <span className="loading-spinner"></span>}
          {loading ? "Storing..." : "💾 Store Message"}
        </button>

        <button
          type="button"
          className="preset-btn"
          onClick={addToPresets}
          disabled={loading}
        >
          ➕ Add to Presets
        </button>
      </form>

      {/* Preset Lists */}
      {(textPresets.length > 0 || imagePresets.length > 0) && (
        <div className="presets-section">
          <div className="presets-header">
            <h2>📋 Saved Presets (Offline Mode)</h2>
            <div className="presets-actions">
              <button
                className="copy-clipboard-btn"
                onClick={copyPresetsToClipboard}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="send-all-btn"
                onClick={sendAllPresets}
                disabled={sendingPresets}
              >
                {sendingPresets && <span className="loading-spinner"></span>}
                {sendingPresets
                  ? "Storing All..."
                  : `💾 Store All (${
                      textPresets.length + imagePresets.length
                    })`}
              </button>
              <button className="clear-all-btn" onClick={clearAllPresets}>
                🗑️ Clear All
              </button>
            </div>
          </div>

          {textPresets.length > 0 && (
            <div className="preset-list">
              <h3>Text Messages ({textPresets.length})</h3>
              {textPresets.map((textMsg, index) => (
                <div key={index} className="preset-item">
                  <span className="preset-text">{textMsg}</span>
                  <div className="preset-actions">
                    <button
                      className="copy-preset-btn"
                      onClick={() => copySingleText(textMsg)}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                    <button
                      className="paste-preset-btn"
                      onClick={() => copyAndPasteText(textMsg)}
                      title="Copy & Auto-paste to other window"
                    >
                      🚀 Paste
                    </button>
                    <button
                      className="send-preset-btn"
                      onClick={() => sendSingleTextPreset(textMsg, index)}
                    >
                      💾 Store
                    </button>
                    <button
                      className="remove-preset-btn"
                      onClick={() => removeTextPreset(index)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imagePresets.length > 0 && (
            <div className="preset-list">
              <h3>Images ({imagePresets.length})</h3>
              <div className="image-presets-grid">
                {imagePresets.map((imgData, index) => (
                  <div key={index} className="image-preset-item">
                    <img src={imgData.preview} alt={imgData.name} />
                    <span className="image-preset-name">{imgData.name}</span>
                    <div className="image-preset-actions">
                      <button
                        className="copy-preset-btn-small"
                        onClick={() => copySingleImage(imgData)}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                      <button
                        className="paste-preset-btn-small"
                        onClick={() => copyAndPasteImage(imgData)}
                        title="Copy & Auto-paste to other window"
                      >
                        🚀
                      </button>
                      <button
                        className="send-preset-btn-small"
                        onClick={() => sendSingleImagePreset(imgData, index)}
                        title="Store"
                      >
                        💾
                      </button>
                      <button
                        className="remove-preset-btn"
                        onClick={() => removeImagePreset(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clipboard History Modal (Electron only) */}
      {isElectron && showClipboardHistory && (
        <div
          className="modal-overlay"
          onClick={() => setShowClipboardHistory(false)}
        >
          <div className="clipboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="clipboard-modal-header">
              <h2>📋 Clipboard History</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowClipboardHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="clipboard-history-list">
              {clipboardHistory.length === 0 ? (
                <p>No clipboard history yet</p>
              ) : (
                clipboardHistory.map((item, index) => (
                  <div key={index} className="clipboard-history-item">
                    {item.type === "text" ? (
                      <>
                        <span className="clipboard-type-badge">Text</span>
                        <div className="clipboard-content">{item.content}</div>
                      </>
                    ) : (
                      <>
                        <span className="clipboard-type-badge">Image</span>
                        <img
                          src={item.preview}
                          alt="Clipboard"
                          className="clipboard-image-preview"
                        />
                      </>
                    )}
                    <div className="clipboard-timestamp">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="message-history">
          <h2>Recent Messages</h2>
          {messages.slice(0, 10).map((msg) => (
            <div key={msg._id} className="message-item">
              <div>
                <strong>{msg.text}</strong>
                <span className={`message-status ${msg.status}`}>
                  {msg.status}
                </span>
              </div>
              {msg.imageUrl && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={`http://localhost:5000${msg.imageUrl}`}
                    alt="Message attachment"
                    style={{ maxWidth: "200px", borderRadius: "8px" }}
                  />
                </div>
              )}
              <div
                style={{ fontSize: "0.85rem", color: "#666", marginTop: "8px" }}
              >
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
