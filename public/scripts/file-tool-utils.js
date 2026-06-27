(() => {
  const defaultImageTypes = ["image/jpeg", "image/png", "image/webp"];

  function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${bytes}B`;
  }

  function totalSize(files) {
    return files.reduce((sum, file) => sum + file.size, 0);
  }

  function fileTypes(files) {
    return [...new Set(files.map((file) => file.type || "unknown"))].join(",");
  }

  function validateImageFiles(files, options = {}) {
    const {
      maxFiles = 20,
      maxFileSize = 12 * 1024 * 1024,
      maxTotalSize = 50 * 1024 * 1024,
      allowedTypes = defaultImageTypes
    } = options;

    if (files.length === 0) return { ok: false, reason: "empty" };
    if (files.length > maxFiles) return { ok: false, reason: "too_many_files" };
    if (totalSize(files) > maxTotalSize) return { ok: false, reason: "total_size_too_large" };
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) return { ok: false, reason: "unsupported_file_type" };
      if (file.size > maxFileSize) return { ok: false, reason: "file_too_large" };
    }
    return { ok: true };
  }

  function validationMessage(reason, emptyMessage = "이미지를 선택해 주세요.") {
    if (reason === "too_many_files") return "이미지는 최대 20장까지 선택할 수 있습니다.";
    if (reason === "total_size_too_large") return "전체 이미지 용량은 50MB 이하로 선택해 주세요.";
    if (reason === "file_too_large") return "이미지 한 장은 12MB 이하만 사용할 수 있습니다.";
    if (reason === "unsupported_file_type") return "JPG, PNG, WebP 이미지만 사용할 수 있습니다.";
    return emptyMessage;
  }

  function safeFileAnalyticsPayload(files) {
    return {
      file_count: files.length,
      total_size: totalSize(files),
      file_types: fileTypes(files)
    };
  }

  function imageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image_decode_failed"));
      };
      image.src = url;
    });
  }

  function canvasToBlob(canvas, type = "image/jpeg", quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("canvas_export_failed"));
        },
        type,
        quality
      );
    });
  }

  function scaledImageDimensions(sourceWidth, sourceHeight, maxSide = Infinity) {
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    return { width, height };
  }

  function drawImageOnCanvas(image, width, height, backgroundColor = "") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_context_unavailable");
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }

  function drawImageOnWhiteCanvas(image, width, height) {
    return drawImageOnCanvas(image, width, height, "#ffffff");
  }

  async function exportImageFile(file, options = {}) {
    const {
      maxSide = Infinity,
      width: requestedWidth,
      height: requestedHeight,
      type = "image/jpeg",
      quality = 0.92
    } = options;
    const image = await imageFromFile(file);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) throw new Error("image_decode_failed");

    const dimensions =
      requestedWidth && requestedHeight
        ? { width: Math.max(1, Math.round(requestedWidth)), height: Math.max(1, Math.round(requestedHeight)) }
        : scaledImageDimensions(sourceWidth, sourceHeight, maxSide);
    const canvas = drawImageOnWhiteCanvas(image, dimensions.width, dimensions.height);
    const blob = await canvasToBlob(canvas, type, quality);
    return {
      blob,
      bytes: await blob.arrayBuffer(),
      width: dimensions.width,
      height: dimensions.height
    };
  }

  function revokeResult(result) {
    if (result?.url) URL.revokeObjectURL(result.url);
  }

  function revokePreviewItems(items) {
    for (const item of items) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      revokeResult(item.result);
    }
  }

  function createFileItems(files, nextId) {
    return files.map((file) => ({
      id: nextId(),
      file,
      previewUrl: URL.createObjectURL(file),
      result: null
    }));
  }

  function outputExtension(type) {
    if (type === "image/webp") return "webp";
    if (type === "image/png") return "png";
    return "jpg";
  }

  window.KdocFileTools = {
    defaultImageTypes,
    formatBytes,
    totalSize,
    fileTypes,
    validateImageFiles,
    validationMessage,
    safeFileAnalyticsPayload,
    imageFromFile,
    canvasToBlob,
    scaledImageDimensions,
    drawImageOnCanvas,
    drawImageOnWhiteCanvas,
    exportImageFile,
    revokeResult,
    revokePreviewItems,
    createFileItems,
    outputExtension
  };
})();
