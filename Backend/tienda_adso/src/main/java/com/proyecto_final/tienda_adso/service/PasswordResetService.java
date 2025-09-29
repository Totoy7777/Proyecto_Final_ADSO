package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class PasswordResetService {

    public enum VerificationStatus {
        SUCCESS,
        USER_NOT_FOUND,
        CODE_NOT_REQUESTED,
        CODE_EXPIRED,
        INVALID_CODE
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Z])(?=.*[$%&/_-]).{6,}$");
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    @Value("${app.mail.from:no-reply@tienda-adso.local}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("No existe una cuenta asociada a ese correo"));

        String code = generateCode();
        user.setResetCode(passwordEncoder.encode(code));
        user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        logger.info("Se generó código de verificación {} para el usuario {}", code, user.getEmail());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Código de verificación");
        message.setText("Hola " + user.getNombre() + ",\n\n" +
                "Tu código de verificación es: " + code + "\n" +
                "Este código expirará en 10 minutos." + "\n\n" +
                "Si no solicitaste este código, puedes ignorar este mensaje.");
        if (mailFrom != null && !mailFrom.isBlank()) {
            message.setFrom(mailFrom);
        } else if (mailUsername != null && !mailUsername.isBlank()) {
            message.setFrom(mailUsername);
        }

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            logger.error("No se pudo enviar el correo de verificación: {}", ex.getMessage(), ex);
            throw new IllegalStateException("No se pudo enviar el correo de verificación", ex);
        }
    }

    public VerificationStatus verifyCode(String email, String code) {
        Validation validation = validate(email, code);
        return validation.status;
    }

    public VerificationStatus resetPassword(String email, String code, String newPassword) {
        Validation validation = validate(email, code);
        if (validation.status != VerificationStatus.SUCCESS) {
            return validation.status;
        }

        if (newPassword == null) {
            throw new IllegalArgumentException("La nueva contraseña es obligatoria");
        }
        String sanitizedPassword = newPassword.trim();
        if (!PASSWORD_PATTERN.matcher(sanitizedPassword).matches()) {
            throw new IllegalArgumentException("La contraseña debe tener mínimo 6 caracteres, una mayúscula y un símbolo ($%&/_-)");
        }

        User user = validation.user;
        user.setPasswordHash(passwordEncoder.encode(sanitizedPassword));
        user.setResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);
        return VerificationStatus.SUCCESS;
    }

    private Validation validate(String email, String code) {
        User user = userRepository.findByEmail(normalizeEmail(email)).orElse(null);
        if (user == null) {
            return new Validation(null, VerificationStatus.USER_NOT_FOUND);
        }

        if (user.getResetCode() == null || user.getResetCodeExpiresAt() == null) {
            return new Validation(user, VerificationStatus.CODE_NOT_REQUESTED);
        }

        if (user.getResetCodeExpiresAt().isBefore(LocalDateTime.now())) {
            return new Validation(user, VerificationStatus.CODE_EXPIRED);
        }

        if (code == null || code.isBlank()) {
            return new Validation(user, VerificationStatus.INVALID_CODE);
        }

        boolean matches = passwordEncoder.matches(code.trim(), user.getResetCode());
        if (!matches) {
            return new Validation(user, VerificationStatus.INVALID_CODE);
        }

        return new Validation(user, VerificationStatus.SUCCESS);
    }

    private String generateCode() {
        int value = random.nextInt(1_000_000);
        return String.format("%06d", value);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }
        return email.trim().toLowerCase();
    }

    private record Validation(User user, VerificationStatus status) {}
}
