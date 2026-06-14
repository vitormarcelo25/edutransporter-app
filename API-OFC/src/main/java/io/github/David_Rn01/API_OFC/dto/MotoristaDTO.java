package io.github.David_Rn01.API_OFC.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class MotoristaDTO {
    private String cpf;
    private String nome;
    private String numeroCelular;
    private String senha;
    private String carteiraConducao;
    private String nomeCidade;
    private String nomeEstado;
}
