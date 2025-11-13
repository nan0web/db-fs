import { suite, describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import process from "node:process"
import { resolve } from "node:path"
import DB from "./DBFS.js"

suite("DB URI Core - POSIX style", () => {
	describe("resolveSync", () => {
		it("resolves relative paths within virtual space", () => {
			const db = new DB({ cwd: "/base/cwd/sub" })
			assert.strictEqual(db.resolveSync("file.txt"), "file.txt")
		})

		it("resolves parent directories correctly", () => {
			const db = new DB({ cwd: "/base/cwd/sub" })
			assert.strictEqual(db.resolveSync("../file.txt"), "file.txt")
		})

		it("normalizes multiple path segments", () => {
			const db = new DB({ root: "/base", cwd: "/base" })
			assert.strictEqual(db.resolveSync("a", "b", "../c"), "a/c")
		})

		it("handles root boundary correctly", () => {
			const db = new DB({ root: "/base", cwd: "/cwd" })
			assert.strictEqual(db.resolveSync("../.."), ".")
		})
	})

	describe("normalize", () => {
		it("normalizes abolute", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("/a"), "a")
		})

		it("normalizes dot segments", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("a/./b"), "a/b")
		})

		it("resolves double dot segments", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("a/b/../c"), "a/c")
		})

		it("removes duplicate slashes", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("a//b///c"), "a/b/c")
		})

		it("preserves trailing directory slashes", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("a/b/"), "a/b/")
		})

		it("handles multiple arguments", () => {
			const db = new DB()
			assert.strictEqual(db.normalize("root", "a/b", "../c", "d"), "root/a/c/d")
		})

		it("should normalize path with //", () => {
			const db = new DB()
			assert.equal(db.normalize("/root", "/dir", "file.txt"), "root/dir/file.txt")
			assert.equal(db.normalize("/root", "/dir", "..", "file.txt"), "root/file.txt")
			assert.equal(db.normalize("playground/_/", "..", "_"), "playground/_")
			assert.equal(db.normalize("playground/_", "..", "_"), "playground/_")
		})

		it("should normalize after root only", () => {
			const db = new DB({ root: "data" })
			assert.equal(db.normalize("_", "langs.yaml"), "_/langs.yaml")
		})
	})

	describe("extract", () => {
		it.skip("should handle empty root from extract", () => {
			// @todo add remote files support if needed
			const db = new DB({ cwd: "https://example.com", root: "." })
			const extracted = db.extract("content")
			assert.strictEqual(extracted.root, "/content/")
			assert.strictEqual(extracted.resolveSync("page.json"), "page.json")
			assert.strictEqual(extracted.absolute("page.json"), "https://example.com/content/page.json")
		})

		it.skip("should handle root normalization in extract", async () => {
			// @todo add remote files support if needed
			const db = new DB({
				cwd: "https://example.com",
				root: "content/",
				predefined: [
					["page1.json", { title: "Page 1" }],
					["blog/post1.json", { title: "Blog Post 1" }],
				]
			})
			await db.connect()
			const blogDb = db.extract("blog")

			assert.strictEqual(blogDb.root, "/content/blog/")
			assert.deepStrictEqual(blogDb.data.get("post1.json"), { title: "Blog Post 1" })
			assert.strictEqual(blogDb.resolveSync("post1.json"), "post1.json")
			assert.strictEqual(blogDb.absolute("post1.json"), "https://example.com/content/blog/post1.json")
		})

		it.skip("should handle multiple levels of extraction", async () => {
			// @todo add remote files support if needed
			const db = new DB({
				cwd: "https://example.com",
				root: "api",
				predefined: [
					["v1/users/john.json", { name: "John" }],
					["v1/users/mary.json", { name: "Mary" }],
				]
			})
			await db.connect()

			const apiV1Db = db.extract("v1")
			const usersDb = apiV1Db.extract("users")

			assert.strictEqual(usersDb.root, "/api/v1/users/")
			const john = await usersDb.loadDocument("john.json")
			assert.deepStrictEqual(john, { name: "John" })
			const mary = await usersDb.loadDocument("mary.json")
			assert.deepStrictEqual(mary, { name: "Mary" })
			assert.strictEqual(usersDb.resolveSync("john.json"), "john.json")
			assert.strictEqual(usersDb.absolute("john.json"), "https://example.com/api/v1/users/john.json")
		})
	})

	describe("basename", () => {
		/** @type {DB} */
		let db

		beforeEach(() => {
			db = new DB()
		})

		it("returns file name for paths", () => {
			assert.strictEqual(db.basename("/dir/file.txt"), "file.txt")
		})

		it("preserves directory trailing slash", () => {
			assert.strictEqual(db.basename("/dir/"), "dir/")
		})

		it("removes specified suffix", () => {
			assert.strictEqual(db.basename("/file.txt", ".txt"), "file")
		})

		it("removes extension when true is specified", () => {
			assert.strictEqual(db.basename("/file.txt", true), "file")
		})

		it("handles root path correctly", () => {
			assert.strictEqual(db.basename("/"), "/")
		})

		it("handles empty path", () => {
			assert.strictEqual(db.basename(""), "")
		})

		it("should calculate file", () => {
			assert.equal(db.basename("some/url/with/a-file.txt"), "a-file.txt")
			assert.equal(db.basename("a-file.txt"), "a-file.txt")
		})
		it("should calculate directory", () => {
			assert.equal(db.basename("some/url/with/"), "with/")
			assert.equal(db.basename("/"), "/")
		})
		it("should calculate file with removed suffix", () => {
			assert.equal(db.basename("some/url/with/a-file.txt", true), "a-file")
			assert.equal(db.basename("some/url/with/a-file.txt", ".txt"), "a-file")
			assert.equal(db.basename("some/url/with/a-file.txt", ".md"), "a-file.txt")
			assert.equal(db.basename("some/url/with/a-file", true), "a-file")
			assert.equal(db.basename("some/url/with/a-file", ".txt"), "a-file")
			assert.equal(db.basename("some/url/with/a.gitignore", true), "a")
			assert.equal(db.basename("some/url/with/.gitignore", true), ".gitignore")
			assert.equal(db.basename("some/url/with/.gitignore", ".gitignore"), ".gitignore")
		})
	})

	describe("dirname", () => {
		/** @type {DB} */
		let db

		beforeEach(() => {
			db = new DB()
		})

		it("returns parent directory", () => {
			assert.strictEqual(db.dirname("/a/b/file"), "/a/b/")
		})

		it("handles directory paths correctly", () => {
			assert.strictEqual(db.dirname("/a/b/"), "/a/")
		})

		it("handles root directory", () => {
			assert.strictEqual(db.dirname("/"), "/")
		})

		it("resolves nested paths", () => {
			assert.strictEqual(db.dirname("/a/b/c/d"), "/a/b/c/")
		})

		it("handles single-level paths", () => {
			assert.strictEqual(db.dirname("/file"), "/")
		})

		it("should calculate file path", () => {
			assert.equal(db.dirname("some/url/with/a-file.txt"), "some/url/with/")
			assert.equal(db.dirname("a-file.txt"), ".")
		})

		it("should calculate directory path", () => {
			assert.equal(db.dirname("some/url/with/"), "some/url/")
			assert.equal(db.dirname("/"), "/")
		})
	})

	describe("extname", () => {
		/** @type {DB} */
		let db

		beforeEach(() => {
			db = new DB()
		})

		it("extracts file extension", () => {
			assert.strictEqual(db.extname("file.Txt"), ".txt")
			assert.strictEqual(db.extname("file.txt"), ".txt")
			assert.strictEqual(db.extname("file.TXT"), ".txt")
		})

		it("handles multiple dots correctly", () => {
			assert.strictEqual(db.extname("archive.tar.gz"), ".gz")
		})

		it("returns empty string for no extension", () => {
			assert.strictEqual(db.extname("file"), "")
		})

		it("handles directory paths", () => {
			assert.strictEqual(db.extname("/dir/"), "")
		})

		it("works with absolute paths", () => {
			assert.strictEqual(db.extname("/root/file.js"), ".js")
		})

		it('should return extension with dot', () => {
			assert.strictEqual(db.extname('file.txt'), '.txt')
			assert.strictEqual(db.extname('archive.tar.gz'), '.gz')
		})

		it('should return empty string if no extension', () => {
			assert.strictEqual(db.extname('filename'), '')
		})

		it('should handle empty string', () => {
			assert.strictEqual(db.extname(''), '')
		})
	})

	describe("resolve", async () => {
		/** @type {DB} */
		let db

		beforeEach(() => {
			db = new DB()
		})

		it("should resolve the path", async () => {
			const path = await db.resolve("a/b", "c")
			assert.equal(path, "a/b/c")
		})
		it("should resolve / directories", async () => {
			const path = await db.resolve("api", "/users")
			assert.equal(path, "/users")
		})
		it("should resolve .. directories", async () => {
			const path = await db.resolve("api/v1/", "..", "users")
			assert.equal(path, "api/users")
		})
		it("should resolve .. in 3 args", async () => {
			const path = await db.resolve("api/v1", "..", "users")
			assert.equal(path, "api/users")
		})
		it("should not resolve .. beyond root", async () => {
			const testCases = [
				{ args: ["..", "_"], expected: "_" },
				{ args: ["../..", "var", "www"], expected: "var/www" },
				{ args: ["../../", "var", "www"], expected: "var/www" },
			]

			for (const { args, expected } of testCases) {
				const result = await db.resolve(...args)
				assert.equal(result, expected, `Failed for args: ${JSON.stringify(args)}`)
			}
		})
	})
	describe("absolute", () => {
		it("should work with absolute root", () => {
			const db = new DB({ root: "/base/cwd/sub" })
			const expected = resolve(process.cwd(), "base/cwd/sub/file.txt")
			assert.strictEqual(db.absolute("file.txt"), expected)
		})
		it("should work with absolute root and cwd", () => {
			const db = new DB({ root: "/base/sub", cwd: "/cwd" })
			assert.strictEqual(db.absolute("file.txt"), "/cwd/base/sub/file.txt")
		})
	})
})
