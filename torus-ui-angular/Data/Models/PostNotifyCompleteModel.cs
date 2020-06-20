using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using torus_ui_angular.HangfireServices;

public class PostNotifyCompleteModel: IValidatableObject
{
    [Required]
    public string TransactionHash { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Notification { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        return Enum.TryParse<TransactionNotification>(Notification, true, out TransactionNotification notification)
            ? Array.Empty<ValidationResult>()
            : new [] { new ValidationResult(
                $"Unrecognized [{nameof(Notification)}] value: {Notification}",
                new [] { nameof(Notification) }) };
    }
}