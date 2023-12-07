//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { FritterContext, FritterMiddlewareFunction } from "@fritter/core";

//
// Middleware
//

export type ComponentFunction<ComponentFunctionOptions> = (options : ComponentFunctionOptions) => DE;

export type FritterRenderComponentMiddlewareFritterContext<RenderComponentOptions, BaseFritterContext extends FritterContext = FritterContext> =
	BaseFritterContext &
	{
		renderComponent : FritterRenderComponentMiddlewareRenderComponentFunction<RenderComponentOptions>
	};

export type FritterRenderComponentMiddlewareGetOptionsFunction<ComponentFunctionOptions, BaseFritterContext extends FritterContext = FritterContext> =
	(
		context : FritterRenderComponentMiddlewareFritterContext<ComponentFunctionOptions, BaseFritterContext>,
		options : Partial<ComponentFunctionOptions>,
	) => ComponentFunctionOptions;

export type FritterRenderComponentMiddlewareRenderComponentFunction<ComponentFunctionOptions> = (options : Partial<ComponentFunctionOptions>) => void;

export class FritterRenderComponentMiddleware<ComponentFunctionOptions, BaseFritterContext extends FritterContext = FritterContext>
{
	componentFunction : ComponentFunction<ComponentFunctionOptions>;

	execute : FritterMiddlewareFunction<FritterRenderComponentMiddlewareFritterContext<ComponentFunctionOptions, BaseFritterContext>>;

	getOptionsFunction : FritterRenderComponentMiddlewareGetOptionsFunction<ComponentFunctionOptions, BaseFritterContext>;

	constructor(componentFunction : ComponentFunction<ComponentFunctionOptions>, getOptionsFunction : FritterRenderComponentMiddlewareGetOptionsFunction<ComponentFunctionOptions, BaseFritterContext>)
	{
		this.componentFunction = componentFunction;

		this.getOptionsFunction = getOptionsFunction;

		this.execute = async (context, next) =>
		{
			//
			// Add Render Component Function
			//

			context.renderComponent = (options) =>
			{
				const fullOptions = this.getOptionsFunction(context, options);

				const component = this.componentFunction(fullOptions);

				context.fritterResponse.setContentType("text/html");
				context.fritterResponse.setBody(component.renderToString());
			};

			//
			// Execute Next Middleware
			//

			await next();
		};
	}
}