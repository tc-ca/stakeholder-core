using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.IO;
using System.Xml.Serialization;

namespace Core.Localization
{
    public class Configuration
    {
        private static readonly string SEPARATOR = "::";

        private Settings settings;

        public Configuration(string config)
        {
            var serializer = new XmlSerializer(typeof(Settings));
            using (var reader = new StringReader(config))
            {
                settings = serializer.Deserialize(reader) as Settings;
            }
        }
        
        public string[] Columns
        {
            get
            {
                var cols = new List<string>();
                foreach(var item in settings.Items)
                {
                    cols.Add(item.FieldEn);
                    cols.Add(item.FieldFr);
                }

                return cols.ToArray();
            }
        }

        private Configuration() { }

        public void Write(Entity entity)
        {
            foreach (var item in settings.Items)
            {
                if (!entity.Has(item)) continue;
                if (entity.Contains(item.FieldEn) && !entity.Contains(item.FieldFr)) entity[item.FieldFr] = entity[item.FieldEn];
                if (entity.Contains(item.FieldFr) && !entity.Contains(item.FieldEn)) entity[item.FieldEn] = entity[item.FieldFr];

                if (entity[item.FieldEn].ToString().Contains(SEPARATOR)) throw new Exception($"{item.FieldEn} cannot contain \"{SEPARATOR}\"");
                if (entity[item.FieldFr].ToString().Contains(SEPARATOR)) throw new Exception($"{item.FieldFr} cannot contain \"{SEPARATOR}\"");

                entity[item.Field] = $"{entity[item.FieldEn]}::{entity[item.FieldFr]}";
            }
        }

        public void Read(Entity entity, int lcid)
        {
            foreach (var item in settings.Items)
            {
                if (!entity.Contains(item.Field)) continue;
                
                var value = entity[item.Field];
                string label;
                if (value.GetType() == typeof(EntityReference))
                    label = ((EntityReference)value).Name;
                else
                    label = value.ToString();

                if (!label.Contains(SEPARATOR)) continue;

                var values = label.ToString().Split(new[] { SEPARATOR }, StringSplitOptions.RemoveEmptyEntries);

                if (value.GetType() == typeof(EntityReference))
                {
                    var er = (EntityReference)entity[item.Field];
                    er.Name = lcid == 1033 ? values[0] : values[1];
                    entity[item.Field] = er;
                }
                else
                    entity[item.Field] = lcid == 1033 ? values[0] : values[1];
            }
        }
        
        [Serializable]
        public class Settings
        {
            public Item[] Items { get; set; }
        }

        [Serializable]
        public class Item
        {
            public Item() { }

            public string Field { get; set; }
            public string FieldEn { get; set; }
            public string FieldFr { get; set; }
        }
    }
}
