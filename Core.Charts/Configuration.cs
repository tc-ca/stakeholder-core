using System;

namespace Core.Charts
{
    [Serializable]
    public class Configuration
    {
        public Guid Id { get; set; }
        public string OldText { get; set; }
        public string NewText { get; set; }
    }
}
