package io.github.David_Rn01.API_OFC.dto;

import io.github.David_Rn01.API_OFC.model.Presente;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PresencaDTO {
    private Integer idViagem;
    private String cpfAluno;
    private LocalDate dataViagem;
    private String nomeMotorista;
}
