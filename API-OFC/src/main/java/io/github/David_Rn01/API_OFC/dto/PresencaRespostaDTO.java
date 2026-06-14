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
public class PresencaRespostaDTO {
    private String nomeAluno;
    private LocalDate dataViagem;
    private Presente presente;
    private LocalDateTime confirmadoEm;
}
