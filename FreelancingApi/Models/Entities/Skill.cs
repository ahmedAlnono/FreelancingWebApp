namespace FreelancingApi.Models.Entities;

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // dev, design, writing, marketing, video, business
    public virtual ICollection<UserSkill> Users { get; set; } = [];
    public virtual ICollection<Job> Jobs { get; set; } = [];
}

public class UserSkill : BaseEntity
{
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public int SkillId { get; set; }
    public virtual Skill Skill { get; set; } = null!;
    
    public int YearsOfExperience { get; set; }
}
