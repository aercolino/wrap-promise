const chai = require('chai');
const sinon = require('sinon');
const sinonTest = require('sinon-test')(sinon);
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");

const { $wrapPromise } = require('../src/index.js');
 
chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('wrap-promise', function () {

	describe('$wrapPromise', function () {

		it('should return a Promise', sinonTest(function (done) {
			const result = $wrapPromise(() => new Promise(resolve => resolve()), ()=>{}, ()=>{});
			expect(result).to.respondTo('then');
			done();
		}));

		it('should throw when used on anything but a function returning a thenable', sinonTest(function (done) {
			let result = () => $wrapPromise(1, ()=>{}, ()=>{});
			expect(result).to.throw('(promise)');
			result = () => $wrapPromise({}, ()=>{}, ()=>{});
			expect(result).to.throw('(promise)');
			result = () => $wrapPromise(()=>{}, ()=>{}, ()=>{});
			expect(result).to.throw('(promise)');
			result = () => $wrapPromise(()=>({then: 1}), ()=>{}, ()=>{});
			expect(result).to.throw('(promise)');
			done();
		}));

		it('should throw when given callbacks are not functions', sinonTest(function (done) {
			let result = () => $wrapPromise(() => new Promise(resolve => resolve()), 1, ()=>{}, ()=>{});
			expect(result).to.throw('(before)');
			result = () => $wrapPromise(() => new Promise(resolve => resolve()), ()=>{}, 1, ()=>{});
			expect(result).to.throw('(afterResolve)');
			result = () => $wrapPromise(() => new Promise(resolve => resolve()), ()=>{}, ()=>{}, 1);
			expect(result).to.throw('(afterReject)');
			done();
		}));

		it('should call the before and after callbacks before and after the promise chain (keeping fulfillment)', sinonTest(function () {
			const stack = [];
			const p = () => new Promise((resolve) => {
				stack.push(1);
				resolve();
			}).then(() => stack.push(2));
			const before = () => stack.push(3);
			const after = () => stack.push(4);
			const result = $wrapPromise(p, before, after).then(() => stack.join(''));
			return expect(result).to.eventually.eql('3124');
		}));

		it('should call the before and after callbacks before and after the promise chain (keeping rejection)', sinonTest(function () {
			const stack = [];
			const p = () => new Promise((resolve) => {
				stack.push(1);
				resolve();
			}).then(() => {
				throw new Error('test');
			});
			const before = () => stack.push(3);
			const after = () => stack.push(4);
			const result = $wrapPromise(p, before, after).catch(() => stack.join(''));
			return expect(result).to.eventually.eql('314');
		}));

		it('should resolve when the special afterReject (swallowing) callback is given', sinonTest(function () {
			const stack = [];
			const p = () => new Promise((resolve) => {
				stack.push(1);
				resolve();
			}).then(() => {
				throw new Error('test');
			});
			const before = () => stack.push(3);
			const after = () => stack.push(4);
			const afterReject = () => stack.push(5);
			const result = $wrapPromise(p, before, after, afterReject).then(() => stack.join(''));
			return expect(result).to.eventually.eql('315');
		}));

		it('should reject when the special afterReject (non swallowing) callback is given', sinonTest(function () {
			const stack = [];
			const p = () => new Promise((resolve) => {
				stack.push(1);
				resolve();
			}).then(() => {
				throw new Error('test');
			});
			const before = () => stack.push(3);
			const after = () => stack.push(4);
			const afterReject = () => {
				throw new Error('test');
			};
			const result = $wrapPromise(p, before, after, afterReject).catch(() => stack.join(''));
			return expect(result).to.eventually.eql('31');
		}));

	});

});
