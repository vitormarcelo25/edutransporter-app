package io.github.David_Rn01.API_OFC.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AlunoRespostaDTO {
    private String nome;
    private String numero_celular;
    private String nomeCidade;
    private String nomeEstado;
    private String nomeFaculdade;
}
