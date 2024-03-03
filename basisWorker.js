/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/basisWorker.ts":
/*!****************************!*\
  !*** ./src/basisWorker.ts ***!
  \****************************/
/***/ (function() {

eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nimportScripts(\"basis_encoder.js\");\n(() => __awaiter(void 0, void 0, void 0, function* () {\n    let basis;\n    self.addEventListener(\"message\", (message) => __awaiter(void 0, void 0, void 0, function* () {\n        const { data } = message;\n        const basis = yield getBasis();\n        if (data.mode === \"encode\") {\n            const { BasisEncoder, initializeBasis } = basis;\n            for (const file of data.data) {\n                const data = yield file.texture.arrayBuffer();\n                initializeBasis();\n                const basisFileData = new Uint8Array(1024 * 1024 * 10);\n                let outputBytes;\n                const basisEncoder = new BasisEncoder();\n                basisEncoder.setSliceSourceImage(0, new Uint8Array(data), 0, 0, true);\n                basisEncoder.setDebug(false);\n                basisEncoder.setComputeStats(false);\n                basisEncoder.setPerceptual(true);\n                basisEncoder.setMipSRGB(true);\n                basisEncoder.setQualityLevel(255);\n                basisEncoder.setUASTC(true);\n                basisEncoder.setMipGen(false);\n                outputBytes = basisEncoder.encode(basisFileData);\n                const actualBasisData = new Uint8Array(basisFileData.buffer, 0, outputBytes);\n                basisEncoder.delete();\n                const error = {\n                    error: \"Failed to convert image to basis\",\n                    status: \"error\",\n                };\n                if (outputBytes === 0)\n                    return postMessage(error);\n                postMessage({\n                    name: file.name,\n                    texture: actualBasisData,\n                });\n            }\n            return;\n        }\n        if (data.mode === \"transcode\") {\n            let BASIS_FORMAT;\n            (function (BASIS_FORMAT) {\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFETC1\"] = 0] = \"cTFETC1\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFETC2\"] = 1] = \"cTFETC2\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBC1\"] = 2] = \"cTFBC1\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBC3\"] = 3] = \"cTFBC3\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBC4\"] = 4] = \"cTFBC4\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBC5\"] = 5] = \"cTFBC5\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBC7\"] = 6] = \"cTFBC7\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFPVRTC1_4_RGB\"] = 7] = \"cTFPVRTC1_4_RGB\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFPVRTC1_4_RGBA\"] = 8] = \"cTFPVRTC1_4_RGBA\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFASTC_4x4\"] = 9] = \"cTFASTC_4x4\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFATC_RGB\"] = 10] = \"cTFATC_RGB\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFATC_RGBA_INTERPOLATED_ALPHA\"] = 11] = \"cTFATC_RGBA_INTERPOLATED_ALPHA\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFRGBA32\"] = 12] = \"cTFRGBA32\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFRGB565\"] = 13] = \"cTFRGB565\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFBGR565\"] = 14] = \"cTFBGR565\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFRGBA4444\"] = 15] = \"cTFRGBA4444\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFFXT1_RGB\"] = 16] = \"cTFFXT1_RGB\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFPVRTC2_4_RGB\"] = 17] = \"cTFPVRTC2_4_RGB\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFPVRTC2_4_RGBA\"] = 18] = \"cTFPVRTC2_4_RGBA\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFETC2_EAC_R11\"] = 19] = \"cTFETC2_EAC_R11\";\n                BASIS_FORMAT[BASIS_FORMAT[\"cTFETC2_EAC_RG11\"] = 20] = \"cTFETC2_EAC_RG11\";\n            })(BASIS_FORMAT || (BASIS_FORMAT = {}));\n            const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;\n            const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;\n            const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;\n            const COMPRESSED_RGBA_BPTC_UNORM = 0x8E8C;\n            const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;\n            const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;\n            const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;\n            const DXT_FORMAT_MAP = new Map([\n                [BASIS_FORMAT.cTFBC1, COMPRESSED_RGB_S3TC_DXT1_EXT],\n                [BASIS_FORMAT.cTFBC3, COMPRESSED_RGBA_S3TC_DXT5_EXT],\n                [BASIS_FORMAT.cTFBC7, COMPRESSED_RGBA_BPTC_UNORM]\n            ]);\n            const { BasisFile, initializeBasis } = basis;\n            const canvas = data.canvas;\n            const gl = canvas.getContext(\"webgl\");\n            const webglSupported = gl !== null;\n            if (!webglSupported) {\n                const error = {\n                    error: \"WebGL not supported\",\n                    status: \"error\"\n                };\n                return postMessage(error);\n            }\n            ;\n            const astcSupported = !!gl.getExtension(\"WEBGL_compressed_texture_astc\");\n            const etcSupported = !!gl.getExtension(\"WEBGL_compressed_texture_etc1\");\n            const dxtSupported = !!gl.getExtension(\"WEBGL_compressed_texture_s3tc\");\n            const pvrtcSupported = !!(gl.getExtension(\"WEBGL_compressed_texture_pvrtc\")) || !!(gl.getExtension(\"WEBKIT_WEBGL_compressed_texture_pvrtc\"));\n            const bc7Supported = !!gl.getExtension(\"EXT_texture_compression_bptc\");\n            const uniformLocations = {};\n            const attributeLocations = {};\n            let program;\n            let quadBuffer;\n            if (webglSupported) {\n                quadBuffer = gl.createBuffer();\n                if (quadBuffer === null)\n                    throw new Error(\"Could not create WebGL buffer\");\n                gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\n                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW);\n                function compileShader(source, type) {\n                    const shader = gl.createShader(type);\n                    if (shader === null)\n                        throw new Error(\"Could not create WebGL shader\");\n                    gl.shaderSource(shader, source);\n                    gl.compileShader(shader);\n                    if (!(gl === null || gl === void 0 ? void 0 : gl.getShaderParameter(shader, gl.COMPILE_STATUS)))\n                        console.log(gl.getShaderInfoLog(shader));\n                    return shader;\n                }\n                const vertexShader = compileShader(`\r\n          precision highp float;\r\n          attribute vec4 position;\r\n          varying vec2 varyingUV;\r\n          void main(){\r\n            gl_Position = vec4(position.xy, 0.0, 1.0);\r\n            varyingUV = position.zw;\r\n          }\r\n        `, gl.VERTEX_SHADER);\n                const fragmentShader = compileShader(`\r\n          precision highp float;\r\n          uniform sampler2D textureSampler;\r\n          uniform vec4 control;\r\n          varying vec2 varyingUV;\r\n          void main(){\r\n            vec4 colour;\r\n            colour = texture2D(textureSampler, varyingUV);\r\n            if(control.x > 0.0){\r\n              colour.w = 1.0;\r\n            }\r\n            else if(control.y > 0.0){\r\n              colour.rgb = colour.aaa;\r\n              colour.w = 1.0;\r\n            }\r\n            gl_FragColor = colour;\r\n          }\r\n        `, gl.FRAGMENT_SHADER);\n                program = gl.createProgram();\n                if (program === null)\n                    throw new Error(\"Could not create WebGL program\");\n                gl.attachShader(program, vertexShader);\n                gl.attachShader(program, fragmentShader);\n                gl.linkProgram(program);\n                gl.useProgram(program);\n                const positionAttributeLocation = gl.getAttribLocation(program, \"position\");\n                gl.bindAttribLocation(program, positionAttributeLocation, \"position\");\n                gl.enableVertexAttribArray(positionAttributeLocation);\n                gl.enable(gl.DEPTH_TEST);\n                gl.disable(gl.CULL_FACE);\n                let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\n                for (let i = 0; i < uniformCount; i++) {\n                    const info = gl.getActiveUniform(program, i);\n                    const result = gl.getUniformLocation(program, info.name);\n                    uniformLocations[info.name] = result;\n                }\n                let attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);\n                for (let i = 0; i < attributeCount; i++) {\n                    const info = gl.getActiveUniform(program, i);\n                    const result = gl.getAttribLocation(program, info.name);\n                    attributeLocations[info.name] = result;\n                }\n            }\n            function createCompressedTexture(destination, width, height, format) {\n                if (!webglSupported)\n                    return \"WebGL not supported\";\n                const texture = gl.createTexture();\n                if (texture === null)\n                    return \"Could not create WebGL texture\";\n                gl.bindTexture(gl.TEXTURE_2D, texture);\n                destination instanceof Uint8Array ? gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, destination) : gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, destination);\n                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n                gl.bindTexture(gl.TEXTURE_2D, null);\n                return texture;\n            }\n            function renderTexture(texture, width, height) {\n                if (!webglSupported)\n                    return;\n                gl.clearColor(0, 0, 0, 1);\n                gl.clearDepth(1);\n                gl.viewport(0, 0, width, height);\n                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);\n                gl.activeTexture(gl.TEXTURE0);\n                gl.bindTexture(gl.TEXTURE_2D, texture);\n                gl.uniform1i(uniformLocations.textureSampler, 0);\n                gl.uniform4f(uniformLocations.control, 0, 0, 0, 0);\n                gl.enableVertexAttribArray(attributeLocations.position);\n                gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\n                gl.vertexAttribPointer(attributeLocations.position, 4, gl.FLOAT, false, 0, 0);\n                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\n            }\n            for (const _file of data.data) {\n                const { name, file } = _file;\n                initializeBasis();\n                const data = new Uint8Array(yield file.arrayBuffer());\n                const basisFile = new BasisFile(data);\n                const width = basisFile.getImageWidth(0, 0);\n                const height = basisFile.getImageHeight(0, 0);\n                const hasAlpha = basisFile.getHasAlpha();\n                if (!width || !height) {\n                    const error = {\n                        error: \"Invalid basis file\",\n                        status: \"error\"\n                    };\n                    return postMessage(error);\n                }\n                ;\n                const format = astcSupported ? BASIS_FORMAT.cTFASTC_4x4 : bc7Supported ? BASIS_FORMAT.cTFBC7 : dxtSupported ? (hasAlpha ? BASIS_FORMAT.cTFBC3 : BASIS_FORMAT.cTFBC1) : pvrtcSupported ? (hasAlpha ? BASIS_FORMAT.cTFPVRTC1_4_RGBA : BASIS_FORMAT.cTFPVRTC1_4_RGB) : etcSupported ? BASIS_FORMAT.cTFETC1 : BASIS_FORMAT.cTFRGB565;\n                if ((format === BASIS_FORMAT.cTFPVRTC1_4_RGBA || format === BASIS_FORMAT.cTFPVRTC1_4_RGB) && (((width & (width - 1)) != 0) || ((height & (height - 1)) != 0) || width !== height)) {\n                    const error = {\n                        error: \"PVRTC1 requires square power of 2 textures\",\n                        status: \"error\",\n                    };\n                    return postMessage(error);\n                }\n                ;\n                if (!basisFile.startTranscoding()) {\n                    basisFile.close();\n                    basisFile.delete();\n                    const error = {\n                        error: \"Transcoding failed\",\n                        status: \"error\"\n                    };\n                    return postMessage(error);\n                }\n                const destination = new Uint8Array(basisFile.getImageTranscodedSizeInBytes(0, 0, format));\n                if (!basisFile.transcodeImage(destination, 0, 0, format, 0, 0)) {\n                    if (!basisFile.startTranscoding()) {\n                        basisFile.close();\n                        basisFile.delete();\n                        const error = {\n                            error: \"Transcoding failed\",\n                            status: \"error\"\n                        };\n                        return postMessage(error);\n                    }\n                }\n                basisFile.close();\n                basisFile.delete();\n                const alignedWidth = (width + 3) & ~3;\n                const alignedHeight = (height + 3) & ~3;\n                let displayWidth = alignedWidth;\n                let displayHeight = alignedHeight;\n                canvas.width = alignedWidth;\n                canvas.height = alignedHeight;\n                let texture;\n                switch (format) {\n                    case BASIS_FORMAT.cTFASTC_4x4:\n                        texture = createCompressedTexture(destination, alignedWidth, alignedHeight, COMPRESSED_RGBA_ASTC_4x4_KHR);\n                        break;\n                    case BASIS_FORMAT.cTFBC1:\n                    case BASIS_FORMAT.cTFBC3:\n                    case BASIS_FORMAT.cTFBC7:\n                        texture = createCompressedTexture(destination, alignedWidth, alignedHeight, DXT_FORMAT_MAP.get(format));\n                        break;\n                    case BASIS_FORMAT.cTFETC1:\n                        texture = createCompressedTexture(destination, alignedWidth, alignedHeight, COMPRESSED_RGB_ETC1_WEBGL);\n                        break;\n                    case BASIS_FORMAT.cTFPVRTC1_4_RGB:\n                        texture = createCompressedTexture(destination, alignedWidth, alignedHeight, COMPRESSED_RGB_PVRTC_4BPPV1_IMG);\n                        break;\n                    case BASIS_FORMAT.cTFPVRTC1_4_RGBA:\n                        texture = createCompressedTexture(destination, alignedWidth, alignedHeight, COMPRESSED_RGBA_PVRTC_4BPPV1_IMG);\n                        break;\n                    default:\n                        canvas.width = width;\n                        canvas.height = height;\n                        displayWidth = width;\n                        displayHeight = height;\n                        const _565Texture = new Uint16Array(width * height);\n                        let pixel = 0;\n                        for (let y = 0; y < height; y++)\n                            for (let x = 0; x < width; x++, pixel++)\n                                _565Texture[pixel] = destination[2 * pixel] | (destination[2 * pixel + 1] << 8);\n                        texture = createCompressedTexture(_565Texture, width, height);\n                }\n                if (typeof texture === \"string\") {\n                    const error = {\n                        error: texture,\n                        status: \"error\",\n                    };\n                    return postMessage(error);\n                }\n                ;\n                renderTexture(texture, displayWidth, displayHeight);\n                const blob = yield canvas.convertToBlob();\n                const blobURL = URL.createObjectURL(blob);\n                postMessage({\n                    name, blobURL\n                });\n            }\n            return;\n        }\n        const error = {\n            error: `Invalid mode. Expected: \"encode\" or \"transcode\". Received: ${data === null || data === void 0 ? void 0 : data.mode}`,\n            status: \"error\"\n        };\n        postMessage(error);\n    }));\n    function getBasis() {\n        return __awaiter(this, void 0, void 0, function* () {\n            if (basis !== undefined)\n                return basis;\n            return BASIS();\n        });\n    }\n}))();\n\n\n//# sourceURL=webpack://melvor-idle-map-maker/./src/basisWorker.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/basisWorker.ts"]();
/******/ 	
/******/ })()
;