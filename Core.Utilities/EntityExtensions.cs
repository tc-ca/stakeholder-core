using Microsoft.Xrm.Sdk;
using System.Collections.Generic;

namespace Core.Utilities
{
    public static class EntityExtensions
    {
        public static bool HasSet(this Entity entity, Dictionary<string, string> set)
        {
            return entity.Contains(set["1033"]) 
                && entity.Contains(set["1036"]);
        }
    }
}
