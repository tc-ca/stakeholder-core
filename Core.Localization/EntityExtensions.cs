using Microsoft.Xrm.Sdk;

namespace Core.Localization
{
    public static class EntityExtensions
    {
        public static bool Has(this Entity entity, Configuration.Item item)
        {
            return (entity.Contains(item.FieldEn) && entity[item.FieldEn] != null)
                || (entity.Contains(item.FieldFr) && entity[item.FieldFr] != null);
        }
    }
}
