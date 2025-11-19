declare module "califi" {
	export function cf(expression: string): Promise<string>;
	export { cf as evaluate };
}


