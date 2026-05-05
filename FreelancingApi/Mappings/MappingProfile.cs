using AutoMapper;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Category mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            // Job mappings
            CreateMap<Job, JobDto>()
                .ForMember(dest => dest.RequiredSkills,
                    opt => opt.MapFrom(src => src.RequiredSkills.Select(s => s.Name)))
                .ForMember(dest => dest.Questions,
                    opt => opt.MapFrom(src => src.Questions.Select(q => q.Question)))
                .ForMember(dest => dest.Client,
                    opt => opt.MapFrom(src => src.Client.ClientProfile));

            CreateMap<CreateJobDto, Job>();

            // Proposal mappings
            CreateMap<Proposal, ProposalDto>()
                .ForMember(dest => dest.JobTitle,
                    opt => opt.MapFrom(src => src.Job.Title));

            CreateMap<CreateProposalDto, Proposal>();

            // Freelancer mappings
            CreateMap<User, FreelancerDto>()
                .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Skills,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.Skills.Select(s => s.Skill.Name)))
                .ForMember(dest => dest.Title,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.Title))
                .ForMember(dest => dest.HourlyRate,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.HourlyRate))
                .ForMember(dest => dest.Rating,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.Rating))
                .ForMember(dest => dest.ReviewsCount,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.ReviewsCount))
                .ForMember(dest => dest.CompletedProjects,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.CompletedProjects))
                .ForMember(dest => dest.HoursWorked,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.HoursWorked))
                .ForMember(dest => dest.ResponseRate,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.ResponseRate))
                .ForMember(dest => dest.IsOnline,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.IsOnline))
                .ForMember(dest => dest.Availability,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.Availability))
                .ForMember(dest => dest.Level,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.Level))
                .ForMember(dest => dest.IsTopRated,
                    opt => opt.MapFrom(src => src.IsTopRated));

            CreateMap<User, FreelancerDetailDto>()
                .IncludeBase<User, FreelancerDto>()
                .ForMember(dest => dest.Bio,
                    opt => opt.MapFrom(src => src.Bio))
                .ForMember(dest => dest.CoverImage,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.CoverImage))
                .ForMember(dest => dest.TotalEarnings,
                    opt => opt.MapFrom(src => src.FreelancerProfile!.TotalEarnings));

            // Client mappings
            CreateMap<User, ClientInfoDto>()
                .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Rating,
                    opt => opt.MapFrom(src => src.ClientProfile!.Rating))
                .ForMember(dest => dest.ReviewsCount,
                    opt => opt.MapFrom(src => src.ClientProfile!.ReviewsCount))
                .ForMember(dest => dest.TotalSpent,
                    opt => opt.MapFrom(src => src.ClientProfile!.TotalSpent))
                .ForMember(dest => dest.JobsPosted,
                    opt => opt.MapFrom(src => src.ClientProfile!.JobsPosted))
                .ForMember(dest => dest.HireRate,
                    opt => opt.MapFrom(src => src.ClientProfile!.HireRate))
                .ForMember(dest => dest.IsVerified,
                    opt => opt.MapFrom(src => src.ClientProfile!.IsVerified));

            // Message mappings
            CreateMap<Message, MessageDto>()
                .ForMember(dest => dest.FromName,
                    opt => opt.MapFrom(src => $"{src.Sender.FirstName} {src.Sender.LastName}"))
                .ForMember(dest => dest.FromAvatar,
                    opt => opt.MapFrom(src => src.Sender.Avatar))
                .ForMember(dest => dest.Preview,
                    opt => opt.MapFrom(src => src.Content.Length > 50
                        ? src.Content.Substring(0, 50) + "..."
                        : src.Content))
                .ForMember(dest => dest.Time,
                    opt => opt.MapFrom(src => FormatTimeAgo(src.CreatedAt)))
                .ForMember(dest => dest.Unread,
                    opt => opt.MapFrom(src => !src.IsRead));

            // Review mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.ReviewerName,
                    opt => opt.MapFrom(src => $"{src.Reviewer.FirstName} {src.Reviewer.LastName}"))
                .ForMember(dest => dest.ReviewerAvatar,
                    opt => opt.MapFrom(src => src.Reviewer.Avatar));

            CreateMap<CreateReviewDto, Review>();

            // Portfolio mappings
            CreateMap<Portfolio, PortfolioDto>()
                .ForMember(dest => dest.Tags,
                    opt => opt.MapFrom(src => src.Tags.Select(t => t.Name)));

            // WorkHistory mappings
            CreateMap<WorkHistory, WorkHistoryDto>();

            // Language mappings
            CreateMap<Language, LanguageDto>();
        }

        private static string FormatTimeAgo(DateTime date)
        {
            var timeSpan = DateTime.UtcNow - date;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes}m ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours}h ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays}d ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)}w ago";

            return date.ToString("MMM d, yyyy");
        }
    }
}