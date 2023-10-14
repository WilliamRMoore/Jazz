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

/***/ "./src/Globals/globals.ts":
/*!********************************!*\
  !*** ./src/Globals/globals.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"canvas\": () => (/* binding */ canvas),\n/* harmony export */   \"ctx\": () => (/* binding */ ctx),\n/* harmony export */   \"debugMode\": () => (/* binding */ debugMode),\n/* harmony export */   \"delta\": () => (/* binding */ delta),\n/* harmony export */   \"gravity\": () => (/* binding */ gravity),\n/* harmony export */   \"previousTime\": () => (/* binding */ previousTime),\n/* harmony export */   \"timeStep\": () => (/* binding */ timeStep)\n/* harmony export */ });\nvar canvas = document.querySelector('canvas');\nvar ctx = canvas.getContext('2d');\nvar gravity = 0.5;\nvar timeStep = 1.0 / 60.0;\n// export const minBodySize = 0.01;\n// export const maxBodySize = ;\nvar previousTime = 0.0;\nvar delta = 0.0;\nvar debugMode = true;\n\n\n//# sourceURL=webpack://my-webpack-project/./src/Globals/globals.ts?");

/***/ }),

/***/ "./src/Physics/FlatVec.ts":
/*!********************************!*\
  !*** ./src/Physics/FlatVec.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"FlatVec\": () => (/* binding */ FlatVec),\n/* harmony export */   \"Transform\": () => (/* binding */ Transform),\n/* harmony export */   \"VectorAdder\": () => (/* binding */ VectorAdder),\n/* harmony export */   \"VectorAdderMutator\": () => (/* binding */ VectorAdderMutator),\n/* harmony export */   \"VectorAllocator\": () => (/* binding */ VectorAllocator),\n/* harmony export */   \"VectorDivider\": () => (/* binding */ VectorDivider),\n/* harmony export */   \"VectorMultiplier\": () => (/* binding */ VectorMultiplier),\n/* harmony export */   \"VectorNegator\": () => (/* binding */ VectorNegator),\n/* harmony export */   \"VectorSubtractor\": () => (/* binding */ VectorSubtractor)\n/* harmony export */ });\nvar FlatVec = /** @class */ (function () {\n    function FlatVec(x, y) {\n        this.X = x;\n        this.Y = y;\n    }\n    FlatVec.prototype.Equals = function (other) {\n        return this.X == other.X && this.Y == other.Y;\n    };\n    return FlatVec;\n}());\n\nvar VectorAdder = function (v1, v2) {\n    return VectorAllocator(v1.X + v2.X, v1.Y + v2.Y);\n};\nvar VectorAdderMutator = function (mutVec, v2) {\n    mutVec.X += v2.X;\n    mutVec.Y += v2.Y;\n};\nvar VectorSubtractor = function (v1, v2) {\n    return VectorAllocator(v1.X - v2.X, v1.Y - v2.Y);\n};\nvar VectorMultiplier = function (v, s) {\n    return VectorAllocator(v.X * s, v.Y * s);\n};\nvar VectorNegator = function (v) {\n    return VectorAllocator(-v.X, -v.Y);\n};\nvar VectorDivider = function (v, s) {\n    return VectorAllocator(v.X / s, v.Y / s);\n};\nvar VectorAllocator = function (x, y) {\n    if (x === void 0) { x = 0; }\n    if (y === void 0) { y = 0; }\n    return new FlatVec(x, y);\n};\nvar Transform = function (v, transform) {\n    return VectorAllocator(transform.Cos * v.X - transform.Sin * v.Y + transform.PositionX, transform.Sin * v.X + transform.Cos * v.Y + transform.PositionY);\n};\n\n\n//# sourceURL=webpack://my-webpack-project/./src/Physics/FlatVec.ts?");

/***/ }),

/***/ "./src/entry.ts":
/*!**********************!*\
  !*** ./src/entry.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"run\": () => (/* binding */ run)\n/* harmony export */ });\n/* harmony import */ var _Globals_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Globals/globals */ \"./src/Globals/globals.ts\");\n/* harmony import */ var _Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Physics/FlatVec */ \"./src/Physics/FlatVec.ts\");\n\n\nfunction run() {\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.canvas.width = 1920;\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.canvas.height = 1080;\n    // init();\n    animate();\n    //R();\n    //PeerRun();\n}\nfunction animate() {\n    window.requestAnimationFrame(animate);\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.clearRect(0, 0, 1920, 1080);\n    testaroo();\n    //tick();\n}\nfunction testaroo() {\n    var poly1 = new Array();\n    var poly2 = new Array();\n    poly1[0] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 0);\n    poly1[1] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 0);\n    poly1[2] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 50);\n    poly1[3] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 50);\n    poly2[0] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 0);\n    poly2[1] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 0);\n    poly2[2] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 50);\n    poly2[3] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 50);\n    var poly3 = new Array();\n    poly3[0] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 0);\n    poly3[1] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 0);\n    poly3[2] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(50, 50);\n    poly3[3] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(0, 50);\n    var start = Move(poly1, (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(100, 100));\n    var finish = Move(poly2, (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(300, 100));\n    var p3 = Move(poly3, (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAllocator)(175, 51));\n    var poly4 = start.concat(finish);\n    function Move(poly, pos) {\n        poly[0] = pos;\n        for (var i = 1; i < poly.length; i++) {\n            poly[i] = (0,_Physics_FlatVec__WEBPACK_IMPORTED_MODULE_1__.VectorAdder)(poly[i], pos);\n        }\n        return poly;\n    }\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.strokeStyle = 'blue';\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.beginPath();\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.moveTo(poly4[0].X, poly4[0].Y);\n    for (var i = 1; i < poly4.length; i++) {\n        _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.lineTo(poly4[i].X, poly4[i].Y);\n    }\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.closePath();\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.fillStyle = 'red';\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.fill();\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.beginPath();\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.moveTo(p3[0].X, p3[0].Y);\n    for (var i = 1; i < p3.length; i++) {\n        _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.lineTo(p3[i].X, p3[i].Y);\n    }\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.closePath();\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.fillStyle = 'orange';\n    _Globals_globals__WEBPACK_IMPORTED_MODULE_0__.ctx.fill();\n}\n// let stagepoints = [\n//   { x: 200, y: 300 },\n//   { x: 400, y: 300 },\n//   { x: 400, y: 325 },\n//   { x: 200, y: 325 },\n// ] as Position[];\n// const stage = new Stage(stagepoints);\n// let pb = Create();\n// pb.atPosition({ x: 200, y: 200 }).withECBOffsets({\n//   top: { xOffset: 0, yOffset: -100 },\n//   left: { xOffset: -50, yOffset: -50 },\n//   bottom: { xOffset: 0, yOffset: 0 },\n//   right: { xOffset: 50, yOffset: -50 },\n// });\n// let P1 = pb.build();\n// let t = 0;\n// function animate() {\n//   window.requestAnimationFrame(animate);\n//   ctx.clearRect(0, 0, 1920, 1080);\n//   tick();\n//   t += 1;\n//   P1.draw();\n//   stage.draw();\n// }\n// const keys = {\n//   d: {\n//     pressed: false,\n//   },\n//   a: {\n//     pressed: false,\n//   },\n//   s: {\n//     pressed: false,\n//   },\n//   w: {\n//     pressed: false,\n//   },\n// };\n// function tick() {\n//   //Get Input\n//   //Implement input...\n//   //Update Position\n//   //P1.updatePosition(pa.allocate(200, t));\n//   //Check for Collisions\n//   //Implements SAT...\n//   //Push calculation results in frame buffer\n//   if (keys.d.pressed) {\n//     P1.updateVelocity(allocateVelocty(2, 0));\n//   } else if (keys.a.pressed) {\n//     P1.updateVelocity(allocateVelocty(-2, 0));\n//   } else if (keys.w.pressed) {\n//     P1.updateVelocity(allocateVelocty(0, -2));\n//   } else if (keys.s.pressed) {\n//     P1.updateVelocity(allocateVelocty(0, 2));\n//   } else {\n//     P1.updateVelocity(allocateVelocty());\n//   }\n//   P1.update();\n// }\n// window.addEventListener('keydown', (e) => {\n//   switch (e.key) {\n//     case 'd':\n//       keys.d.pressed = true;\n//       break;\n//     case 'a':\n//       keys.a.pressed = true;\n//       break;\n//     case 'w':\n//       keys.w.pressed = true;\n//       break;\n//     case 's':\n//       keys.s.pressed = true;\n//   }\n// });\n// window.addEventListener('keyup', (e) => {\n//   switch (e.key) {\n//     case 'd':\n//       keys.d.pressed = false;\n//       break;\n//     case 'a':\n//       keys.a.pressed = false;\n//       break;\n//     case 'w':\n//       keys.w.pressed = false;\n//       break;\n//     case 's':\n//       keys.s.pressed = false;\n//   }\n// });\n//function test() {}\n// Run();\n\n\n//# sourceURL=webpack://my-webpack-project/./src/entry.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _entry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entry */ \"./src/entry.ts\");\n\n(0,_entry__WEBPACK_IMPORTED_MODULE_0__.run)();\n\n\n//# sourceURL=webpack://my-webpack-project/./src/index.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;