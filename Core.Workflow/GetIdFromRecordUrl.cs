using System;
using System.Activities;
using Microsoft.Xrm.Sdk.Workflow;

namespace Core.Workflow
{ 
    public sealed partial class GetIdFromRecordUrl : CodeActivity
    {
        [Input("Dynamic Rrcord URL")]
        [ArgumentRequired]
        public InArgument<string> EntityUrl { get; set; }

        [Output("Id")]
        public OutArgument<string> EntityId { get; set; }

        protected override void Execute(CodeActivityContext ctx)
        {
            var url = EntityUrl.Get(ctx);
            if (string.IsNullOrWhiteSpace(url))
            {
                EntityId.Set(ctx, Guid.Empty.ToString()); // Assuming the entity id is being used as an AK
                return;
            }

            if (!url.Contains("?")) throw new Exception("Record URL does not query string");

            url = url.Substring(url.IndexOf('?') + 1);
            var pairs = url.Split('&');
            var id = string.Empty;
            foreach(var pair in pairs)
            {
                if (!pair.Contains("=")) continue;
                var items = pair.Split('=');
                if (items[0] != "id") continue;

                id = items[1];
            }

            if (string.IsNullOrWhiteSpace(id)) throw new Exception("Record URL query string does not contain record id");
            EntityId.Set(ctx, id);
        }
    }
}
