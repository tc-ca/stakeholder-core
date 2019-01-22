using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Core.Utilities
{
    public static class Language
    {
        public static int GetLcid(Guid userId, IOrganizationService service)
        {
            var result = service.Retrieve("usersettings", userId, new ColumnSet("uilanguageid"));
            return (int)result["uilanguageid"];
        }
    }
}
