export interface InstagramPost {
    id: string;
    media_url: string;
    permalink: string;
    caption?: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    error?: string;
}

// TODO: Replace with user's access token
// TODO: Replace with user's access token
const ACCESS_TOKEN = 'EAA1HgKA1ZBvkBQSTgm4Wu1TSnc7L3NTVsycN830XIcewVKkRzF2HIJulcRGlJeNM8CTywIiWdCkozBBhYTDEE6euVYWU7tLRnUByLk3nAIE7PVfQwTidWceZBGvwTtewJ1beMCd0Ggz1w76D2qF0LFWrUQVZCew97UUfyqrA9tM5shhYmTv71tEZA45rCOewIHiiZBdlLpjfch0GN0F4vTdOcKMRCEPZAJx9yIzZAmYLzsHBDjaowojwsDeEiQrAZAOqDKgi8nWYqYH1cjvBxFP3';

function getMockPosts(): InstagramPost[] {
    return Array.from({ length: 9 }).map((_, i) => ({
        id: `mock-${i}`,
        media_url: `https://picsum.photos/seed/insta${i}/200/200`,
        permalink: 'https://instagram.com/izmiruzmani',
        media_type: 'IMAGE',
        caption: 'Mock Instagram Post'
    }));
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
    if (!ACCESS_TOKEN) {
        console.warn('Instagram Access Token missing, using mock data.');
        return getMockPosts();
    }

    try {
        const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${ACCESS_TOKEN}&limit=9`);

        if (!response.ok) {
            // Try to parse error details
            const errBody = await response.text();
            throw new Error(`API Error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        return data.data as InstagramPost[];
    } catch (error) {
        console.error('Instagram Fetch Error:', error);
        // RETURN ERROR TO UI
        return [{
            id: 'error',
            media_url: '',
            permalink: '',
            media_type: 'IMAGE',
            error: error instanceof Error ? error.message : String(error)
        }];
    }
}
