import GhostContentAPI from "@tryghost/content-api";

// Ghost API configuration
const ghostConfig = {
	url: "http://testing-ghost-8423be-31-220-108-27.traefik.me",
	key: "d8c93e7121f36a95cd60921a04",
	version: "v5.0",
};

// Initialize the Ghost API with your credentials
const api = GhostContentAPI({
	url: ghostConfig.url,
	key: ghostConfig.key,
	version: ghostConfig.version,
	// @ts-ignore
	makeRequest: ({ url, method, params, headers }) => {
		const apiUrl = new URL(url);
		// @ts-ignore
		Object.keys(params).map((key) =>
			apiUrl.searchParams.set(key, encodeURIComponent(params[key])),
		);

		return fetch(apiUrl.toString(), { method, headers })
			.then(async (res) => {
				// Check if the response was successful.
				if (!res.ok) {
					// You can handle HTTP errors here
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return { data: await res.json() };
			})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
	},
});

export interface Post {
	id: string;
	uuid: string;
	title: string;
	slug: string;
	html: string;
	feature_image: string | null;
	featured: boolean;
	visibility: string;
	created_at: string;
	updated_at: string;
	published_at: string;
	custom_excerpt: string | null;
	excerpt: string;
	reading_time: number;
	primary_tag?: {
		id: string;
		name: string;
		slug: string;
	};
	tags?: Array<{
		id: string;
		name: string;
		slug: string;
	}>;
	primary_author?: {
		id: string;
		name: string;
		slug: string;
		profile_image: string | null;
		bio: string | null;
	};
	authors?: Array<{
		id: string;
		name: string;
		slug: string;
		profile_image: string | null;
		bio: string | null;
	}>;
	url: string;
}

export async function getPosts(options = {}): Promise<Post[]> {
	try {
		const result = (await api.posts.browse({
			include: "authors",
			limit: "all",
		})) as Post[];
		console.log("Posts data from Ghost API:", JSON.stringify(result, null, 2));
		return result;
	} catch (error) {
		console.error("Error fetching posts:", error);
		return [];
	}
}

export async function getPost(slug: string): Promise<Post | null> {
	try {
		const result = (await api.posts.read({
			slug,
			include: ["authors"],
		})) as Post;
		return result;
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}

export async function getTags() {
	try {
		const result = await api.tags.browse();
		return result;
	} catch (error) {
		console.error("Error fetching tags:", error);
		return [];
	}
}

export async function getPostsByTag(tag: string) {
	try {
		const result = await api.posts.browse({
			limit: "all",
			filter: `tag:${tag}`,
			include: ["tags", "authors"],
		});
		return result;
	} catch (error) {
		console.error(`Error fetching posts with tag ${tag}:`, error);
		return [];
	}
}
