export type Product = {
id: number;
title?: string;
image_url?: string; // prefer this if provided
images?: string[]; // fallback to [0]
color?: string;
category?: string;
gender?: string;
};


export type Recommendation = Product & {
explanation?: string; // server may send why selected
};


export type Credentials = { email: string; password: string };